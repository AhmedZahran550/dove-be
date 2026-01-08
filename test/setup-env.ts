// Setup environment for E2E tests
// Uses Docker PostgreSQL on port 5433

process.env.NODE_ENV = 'test';
process.env.PORT = '4001';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Database - Docker PostgreSQL
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5433';
process.env.DATABASE_USERNAME = 'postgres';
process.env.DATABASE_PASSWORD = 'postgres123';
process.env.DATABASE_NAME = 'dova_test';

// JWT Configuration
process.env.JWT_ACCESS_SECRET = 'test-jwt-secret-for-e2e-tests';
process.env.JWT_ACCESS_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-e2e-tests';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Cache disabled for tests
process.env.CACHE_ENABLED = 'false';
