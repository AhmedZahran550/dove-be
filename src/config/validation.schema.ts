import { z } from 'zod';

const booleanFromString = z.string().transform((val, ctx) => {
  const normalized = val.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  ctx.addIssue({
    code: 'custom',
    message: `Invalid boolean value: "${val}". Expected "true" or "false".`,
  });
  return z.NEVER;
});

const numberFromString = z.string().transform((val, ctx) => {
  const num = Number(val);
  if (!Number.isNaN(num)) return num;
  ctx.addIssue({
    code: 'invalid_type',
    expected: 'number',
    received: typeof val,
  });
  return z.NEVER;
});

export const configSchema = z
  .object({
    NODE_ENV: z
      .enum(['local', 'development', 'production', 'test', 'staging', 'e2e'])
      .default('development'),

    // Auth
    JWT_ACCESS_SECRET: z.string().min(1, { error: 'JWT_SECRET is required' }),
    JWT_REFRESH_SECRET: z.string().min(1, { error: 'JWT_SECRET is required' }),

    // DB - DATABASE_URL takes precedence (Railway provides this)
    DATABASE_URL: z.string().optional(),

    // Individual DB credentials - required only if DATABASE_URL is not provided
    DATABASE_HOST: z.string().optional(),
    DATABASE_NAME: z.string().optional(),
    DATABASE_USERNAME: z.string().optional(),
    DATABASE_PASSWORD: z.string().optional(),
    DATABASE_PORT: numberFromString.optional(),
    DB_SYNC: booleanFromString.default(false),
  })
  .refine(
    (data) => {
      // If DATABASE_URL exists, we don't need individual credentials
      if (data.DATABASE_URL) return true;
      // Otherwise, require host and password at minimum
      return !!data.DATABASE_HOST && !!data.DATABASE_PASSWORD;
    },
    {
      message:
        'Either DATABASE_URL or (DATABASE_HOST + DATABASE_PASSWORD) must be provided',
    },
  );

// Optionally, define the TypeScript type for the validated config
export type Config = z.infer<typeof configSchema>;
