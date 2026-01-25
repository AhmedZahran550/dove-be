import { registerAs } from '@nestjs/config';
import { CustomNamingStrategy } from 'src/database';

export default registerAs('database', () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    type: 'postgres' as const,
    // If URL is provided (Supabase), use it. Otherwise, use host/port (Docker).
    url: process.env.DATABASE_URL || undefined,
    host: !process.env.DATABASE_URL ? process.env.DATABASE_HOST : undefined,
    port: !process.env.DATABASE_URL
      ? parseInt(process.env.DATABASE_PORT, 10)
      : undefined,
    username: !process.env.DATABASE_URL
      ? process.env.DATABASE_USERNAME
      : undefined,
    password: !process.env.DATABASE_URL
      ? process.env.DATABASE_PASSWORD
      : undefined,
    database: !process.env.DATABASE_URL ? process.env.DATABASE_NAME : undefined,

    entities: [`${__dirname}/../database/entities/*.entity{.ts,.js}`],
    synchronize: process.env.DB_SYNC === 'true', // Auto-sync only in dev (Local Docker)
    logging: process.env.DB_LOGGING === 'true',
    namingStrategy: new CustomNamingStrategy(),
    migrations: [`${__dirname}/../../db/migrations/*{.ts,.js}`],

    // SSL is mandatory for Supabase but usually off for Local Docker
    ssl:
      process.env.DATABASE_URL || isProduction
        ? { rejectUnauthorized: false }
        : false,

    // Recommended for Supabase stability
    extra: isProduction
      ? {
          max: 20,
          connectionTimeoutMillis: 5000,
        }
      : {},
  };
});
