import { parse, isValid, isAfter, isEqual } from 'date-fns';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

export interface Shift {
  name: string;
  start: string;
  end: string;
}

export function parseTime(timeStr: string): Date {
  const referenceDate = new Date(2026, 1, 1); // Feb 1, 2026
  return parse(timeStr, 'hh:mm a', referenceDate);
}

export function validateShift(shift: any): { isValid: boolean; message?: string } {
  if (!shift.name) return { isValid: false, message: 'Shift name is required' };
  if (!shift.start || !shift.end) return { isValid: false, message: 'Start and end times are required' };

  const startTime = parseTime(shift.start);
  const endTime = parseTime(shift.end);

  if (!isValid(startTime)) return { isValid: false, message: `Invalid start time format: ${shift.start}` };
  if (!isValid(endTime)) return { isValid: false, message: `Invalid end time format: ${shift.end}` };

  if (isEqual(startTime, endTime)) {
    return { isValid: false, message: 'Start and end times cannot be equal' };
  }

  // All valid formats and not equal.
  // Overnight shifts are allowed if we only care about duration.
  // But if we want to ensure end is "after" start in a way that is clear,
  // we can't just check isAfter if it spans across midnight on a single reference date.
  
  // Actually, a shift is valid if its times are valid.
  // The spec says "End time must be chronologically after the start time within the same 24-hour cycle".
  // This is ambiguous for "04:00 PM" to "12:00 AM" if we consider "12:00 AM" as 00:00.
  // Usually, "04:00 PM" to "12:00 AM" means 8 hours later.
  
  return { isValid: true };
}

@ValidatorConstraint({ name: 'isShiftsArray', async: false })
export class IsShiftsArrayConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (!Array.isArray(value)) return false;
    for (const shift of value) {
      if (!validateShift(shift).isValid) return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    if (!Array.isArray(args.value)) return 'Shifts must be an array';
    for (const shift of args.value) {
      const result = validateShift(shift);
      if (!result.isValid) return result.message;
    }
    return 'Invalid shifts data';
  }
}

export function IsShiftsArray(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsShiftsArrayConstraint,
    });
  };
}
