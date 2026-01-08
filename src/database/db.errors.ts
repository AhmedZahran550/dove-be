import {
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

/**
 * PostgreSQL error codes
 */
export enum PgErrorCode {
  UniqueViolation = '23505',
  ForeignKeyViolation = '23503',
  NotNullViolation = '23502',
  CheckViolation = '23514',
  InvalidTextRepresentation = '22P02',
  NumericValueOutOfRange = '22003',
  StringDataTooLong = '22001',
}

/**
 * Database error interface
 */
export interface DatabaseError {
  code?: string;
  detail?: string;
  constraint?: string;
  message?: string;
  column?: string;
  table?: string;
}

/**
 * Get a friendly error message from a database error
 */
export function getDbError(error: DatabaseError): Error {
  const code = error.code;

  switch (code) {
    case PgErrorCode.UniqueViolation:
      const field = extractFieldFromConstraint(error.constraint || '');
      return new ConflictException(
        `A record with this ${field || 'value'} already exists`,
      );

    case PgErrorCode.ForeignKeyViolation:
      return new BadRequestException(
        `Referenced record not found: ${error.detail || 'invalid reference'}`,
      );

    case PgErrorCode.NotNullViolation:
      return new BadRequestException(
        `Required field '${error.column}' cannot be null`,
      );

    case PgErrorCode.CheckViolation:
      return new BadRequestException(
        `Validation failed: ${error.constraint || 'check constraint violated'}`,
      );

    case PgErrorCode.InvalidTextRepresentation:
      return new BadRequestException('Invalid data format provided');

    case PgErrorCode.NumericValueOutOfRange:
      return new BadRequestException('Numeric value is out of allowed range');

    case PgErrorCode.StringDataTooLong:
      return new BadRequestException('Text value exceeds maximum length');

    default:
      console.error('Unhandled database error:', error);
      return new InternalServerErrorException('A database error occurred');
  }
}

/**
 * Handle database errors by converting them to HTTP exceptions
 */
export function handleDbError(error: unknown): never {
  if (
    error instanceof ConflictException ||
    error instanceof BadRequestException ||
    error instanceof NotFoundException ||
    error instanceof InternalServerErrorException
  ) {
    throw error;
  }

  const dbError = error as DatabaseError;
  if (dbError.code) {
    throw getDbError(dbError);
  }

  console.error('Unexpected error:', error);
  throw new InternalServerErrorException('An unexpected error occurred');
}

/**
 * Extract field name from constraint name
 * e.g., 'UQ_users_email' -> 'email'
 */
function extractFieldFromConstraint(constraint: string): string | null {
  const parts = constraint.split('_');
  if (parts.length >= 3) {
    return parts.slice(2).join('_');
  }
  return null;
}

/**
 * Check if error is a database error with code
 */
export function isDbError(error: unknown): error is DatabaseError {
  return typeof error === 'object' && error !== null && 'code' in error;
}
