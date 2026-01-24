# Vercel Deployment Guide for NestJS

This guide explains how to configure a NestJS application for deployment on Vercel Serverless Functions, based on the working configuration of the current project.

## 1. Project Structure

Ensure your project follows a standard NestJS structure. The key difference for Vercel is the addition of an API entry point specifically for serverless execution.

```
/
├── api/
│   └── index.ts        # Vercel Serverless Entry Point
├── src/
│   ├── main.ts         # Local Entry Point
│   └── app.module.ts   # Main Module
├── vercel.json         # Vercel Configuration
├── package.json
└── tsconfig.json       # TypeScript Configuration
```

## 2. Dependencies

Ensure you have the necessary dependencies. The `api/index.ts` uses `express` and `tsconfig-paths` to handle module aliases dynamically.

```bash
yarn add @nestjs/platform-express express tsconfig-paths
yarn add -D @types/express
```

## 3. Configure Module Aliases (`tsconfig.json`)

To use path aliases (like `@/common/...`) in Vercel, you must configure `tsconfig.json` correctly. Ensure comments are removed if imported as JSON in your code (strict JSON requirement).

```json
{
  "compilerOptions": {
    "baseUrl": "./src",  // relative to src
    "paths": {
      "@/*": ["./*"],
      "@config/*": ["./config/*"],
      "@entities/*": ["./databases/entities/*"],
      "@shared/*": ["./common/*"]
    },
    ...
  }
}
```

## 4. Create Serverless Entry Point (`api/index.ts`)

Create a `api/index.ts` file. This file must rigorously register path aliases **before** importing any application code.

```typescript
// api/index.ts

// 1. Register Path Aliases FIRST
import { register } from "tsconfig-paths";
import { resolve } from "path";
import * as tsConfig from "../tsconfig.json";

const baseUrl = resolve(__dirname, "../src"); // Point to source directory
register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths || {},
});

// 2. Import Module Alias (if used in addition to tsconfig-paths)
import "module-alias/register";

import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import express, { Express } from "express";

// 3. Import App Modules (Use source imports, not dist)
import { AppModule } from "../src/app.module";
import { setupApp } from "../src/app-setup"; // Shared setup logic

let cachedServer: Express;

async function bootstrapServer(): Promise<Express> {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        logger:
          process.env.NODE_ENV === "production"
            ? ["error", "warn"]
            : ["log", "error", "warn", "debug"],
      },
    );

    if (setupApp) {
      await setupApp(app);
    }

    app.setGlobalPrefix("api");
    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
}

export default async (req: any, res: any) => {
  const server = await bootstrapServer();
  return server(req, res);
};
```

> **Why check `tsconfig.json`?** Importing `tsconfig.json` allows us to dynamically register the same paths defined for development, ensuring consistency.
> **Important:** `tsconfig.json` must be valid JSON (no comments) to be imported this way in Node.js.

## 5. Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "FALLBACK_LANGUAGE": "en"
  }
}
```

## 6. Package.json Scripts

Ensure your build script is standard.

```json
"scripts": {
  "build": "nest build",
  ...
}
```

## 7. Troubleshooting

- **Path Resolution Errors:** If you see errors about modules not found, ensure `tsconfig-paths` is registered at the very top of `api/index.ts`.
- **SyntaxError in tsconfig.json:** If importing `tsconfig.json` fails, ensure it contains **no comments** (`//`). Node.js `require` or `import` of JSON files requires strict JSON compliance.
- **Cold Starts:** Vercel functions have cold starts. The `cachedServer` logic (singleton pattern) helps reuse the NestJS instance across subsequent requests in the same execution environment.
