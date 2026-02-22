// api/index.ts

// 1. Register Path Aliases FIRST
import { register } from 'tsconfig-paths';
import { resolve } from 'path';
import * as tsConfig from '../tsconfig.json';

const baseUrl = resolve(__dirname, '../src'); // Point to source directory
register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths || {},
});

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';

// 3. Import App Modules (Use source imports, not dist)
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app-setup'; // Shared setup logic

let cachedServer: Express;

async function bootstrapServer(): Promise<Express> {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        logger:
          process.env.NODE_ENV === 'production'
            ? ['error', 'warn']
            : ['log', 'error', 'warn', 'debug'],
      },
    );

    if (setupApp) {
      setupApp(app);
    }

    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
}

export default async (req: any, res: any) => {
  const server = await bootstrapServer();
  return server(req, res);
};
