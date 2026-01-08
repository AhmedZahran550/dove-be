// Simple DB connection test
import { DataSource } from 'typeorm';

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Host:', process.env.DATABASE_HOST);
  console.log('Port:', process.env.DATABASE_PORT);
  console.log('Database:', process.env.DATABASE_NAME);

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5433'),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres123',
    database: process.env.DATABASE_NAME || 'dova_test',
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection successful!');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
