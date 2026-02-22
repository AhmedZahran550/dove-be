import { validateShift, parseTime } from './shift.validator';

describe('Shift Validation Utility', () => {
  it('should parse "08:00 AM" correctly', () => {
    const time = parseTime('08:00 AM');
    expect(time.getHours()).toBe(8);
    expect(time.getMinutes()).toBe(0);
  });

  it('should parse "04:00 PM" correctly', () => {
    const time = parseTime('04:00 PM');
    expect(time.getHours()).toBe(16);
    expect(time.getMinutes()).toBe(0);
  });

  it('should parse "12:00 AM" correctly (as midnight)', () => {
    const time = parseTime('12:00 AM');
    expect(time.getHours()).toBe(0);
    expect(time.getMinutes()).toBe(0);
  });

  it('should validate a normal day shift', () => {
    const shift = { name: 'First Shift', start: '08:00 AM', end: '04:00 PM' };
    expect(validateShift(shift).isValid).toBe(true);
  });

  it('should validate a shift ending at midnight', () => {
    const shift = { name: 'Second Shift', start: '04:00 PM', end: '12:00 AM' };
    expect(validateShift(shift).isValid).toBe(true);
  });

  it('should validate an overnight shift', () => {
    const shift = { name: 'Night Shift', start: '10:00 PM', end: '06:00 AM' };
    expect(validateShift(shift).isValid).toBe(true);
  });

  it('should reject shift with invalid time format', () => {
    const shift = { name: 'Invalid', start: '08:00', end: '04:00 PM' };
    expect(validateShift(shift).isValid).toBe(false);
    expect(validateShift(shift).message).toContain('format');
  });

  it('should reject shift where start and end are the same', () => {
    const shift = { name: 'Same', start: '08:00 AM', end: '08:00 AM' };
    expect(validateShift(shift).isValid).toBe(false);
    expect(validateShift(shift).message).toContain('equal');
  });
});
