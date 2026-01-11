import { registerAs } from '@nestjs/config';
import { CustomNamingStrategy } from 'src/database';

export default registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [`${__dirname}/../database/entities/*.entity{.ts,.js}`],
  synchronize: true,
  logging: process.env.DB_LOGGING,
  namingStrategy: new CustomNamingStrategy(),
  migrations: [`${__dirname}/../../db/migrations/*{.ts,.js}`],
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
}));
