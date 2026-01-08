import { Column, ColumnOptions } from 'typeorm';
import { applyDecorators } from '@nestjs/common';

/**
 * Transformer that converts decimal strings to numbers
 */
const decimalTransformer = {
  to: (value: number | null): number | null => value,
  from: (value: string | null): number | null =>
    value !== null ? parseFloat(value) : null,
};

/**
 * Options for DecimalColumn decorator
 */
export interface DecimalColumnOptions {
  precision?: number;
  scale?: number;
  nullable?: boolean;
  default?: number;
  name?: string;
}

/**
 * Decorator for decimal/numeric columns with automatic number conversion
 * @param options Column options (precision, scale, etc.)
 */
export function DecimalColumn(
  options: DecimalColumnOptions = {},
): PropertyDecorator {
  const {
    precision = 10,
    scale = 2,
    nullable = false,
    default: defaultValue,
    name,
  } = options;

  const columnOptions: ColumnOptions = {
    type: 'decimal',
    precision,
    scale,
    nullable,
    transformer: decimalTransformer,
  };

  if (name) columnOptions.name = name;
  if (defaultValue !== undefined) columnOptions.default = defaultValue;

  return Column(columnOptions);
}

/**
 * Decorator for money/currency columns (precision 12, scale 2)
 */
export function MoneyColumn(
  options: Omit<DecimalColumnOptions, 'precision' | 'scale'> = {},
): PropertyDecorator {
  return DecimalColumn({ ...options, precision: 12, scale: 2 });
}

/**
 * Decorator for percentage columns (precision 5, scale 2, 0-100 range)
 */
export function PercentageColumn(
  options: Omit<DecimalColumnOptions, 'precision' | 'scale'> = {},
): PropertyDecorator {
  return DecimalColumn({ ...options, precision: 5, scale: 2 });
}

/**
 * Decorator for quantity columns (precision 10, scale 3)
 */
export function QuantityColumn(
  options: Omit<DecimalColumnOptions, 'precision' | 'scale'> = {},
): PropertyDecorator {
  return DecimalColumn({ ...options, precision: 10, scale: 3 });
}
