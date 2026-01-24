import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { CustomNamingStrategy } from '../src/database/custom-naming.strategy';
import * as path from 'path';

const envFile = path.resolve(__dirname, `../src/config/env/development.env`);
config({ path: envFile });

export default new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_URL_NON_POOLING,
  synchronize: false,
  logging: false,
  entities: [__dirname + '/../src/database/entities/*.entity{.ts,.js}'],
  namingStrategy: new CustomNamingStrategy(),
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  ssl: {
    rejectUnauthorized: false,
  },
});
