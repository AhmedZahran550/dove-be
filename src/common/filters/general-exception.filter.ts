import { AppErrorResponse, FieldError } from '@/common/models/error-response';
import { getError } from '@/database/db.errors copy';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
export class RequestValidationError extends ValidationError {
  message: string;
  code: string;
}

@Catch()
export class GeneralExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GeneralExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    this.logger.error(
      'Exception caught',
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal Server Error';
    let errors: FieldError[] = [];

    if (exception instanceof QueryFailedError) {
      const dbError = getError(exception);
      statusCode = dbError?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = dbError?.errorCode || 'INTERNAL_SERVER_ERROR';
      message = dbError?.message || 'INTERNAL_SERVER_ERROR';
      errors = dbError?.errors || [];
    } else if (exception instanceof EntityNotFoundError) {
      statusCode = HttpStatus.NOT_FOUND;
      errorCode = exception?.['code'] || 'NOT_FOUND';
      message = 'Not Found';
    } else if (exception instanceof BadRequestException) {
      statusCode = HttpStatus.BAD_REQUEST;
      const appError = exception.getResponse();
      errorCode = appError?.['code'] || 'BAD_REQUEST';
      message = 'Bad Request';
      errors = this.extractErrors(appError);
    } else if (exception instanceof ConflictException) {
      statusCode = HttpStatus.CONFLICT;
      const resp = exception.getResponse();
      errorCode = resp?.['code'] || 'CONFLICT';
      message = 'Conflict';
      errors = this.extractErrors(resp?.['message']);
    } else if (exception instanceof UnauthorizedException) {
      statusCode = HttpStatus.UNAUTHORIZED;
      const resp = exception.getResponse();
      errorCode = resp?.['code'] || 'UNAUTHORIZED';
      message = 'Unauthorized';
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      errorCode = 'HTTP_EXCEPTION';
      message = exception.message || 'HTTP exception';
      const resp = exception.getResponse();
      errors = this.extractErrors(resp);
    } else if (exception instanceof RequestValidationError) {
      message = (exception as any).message || message;
      errorCode = (exception as any).code || errorCode;
    } else if (exception instanceof Error) {
      errorCode = exception?.['code'] || errorCode;
      message = exception.message || message;
    }

    const responseBody: AppErrorResponse = {
      statusCode,
      errorCode,
      path: httpAdapter.getRequestUrl(request),
      errors,
      message,
      requestId: response.locals.requestId,
      timestamp: new Date().toISOString(),
    };

    httpAdapter.reply(response, responseBody, statusCode);
  }
  /**
   * Extracts errors from the exception response.
   * @param response The response object from the exception.
   * @returns An array of error details.
   */
  private extractErrors(response: any): any {
    if (Array.isArray(response)) {
      return response;
    }
    if (response?.message && Array.isArray(response.message)) {
      return response.message;
    }
    return [response];
  }
}
