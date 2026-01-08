import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Work Orders E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdWorkOrderId: string;

  const testEmail = `wo-test-${Date.now()}@example.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix('api/v1');
    await app.init();

    // Register and get token
    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'WO Test User',
        email: testEmail,
        phone: '1234567890',
        organizationName: `WO Test Org ${Date.now()}`,
        password: 'TestPassword123!',
      });

    accessToken = registerRes.body.access_token;
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/work-orders', () => {
    it('should create a new work order', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/work-orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          wo_id: 'WO-E2E-001',
          wo_qty: 100,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.wo_number).toBe('WO-E2E-001');
      createdWorkOrderId = response.body.data.id;
    });

    it('should reject request without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/work-orders')
        .send({ wo_id: 'WO-E2E-002', wo_qty: 50 })
        .expect(401);
    });
  });

  describe('GET /api/v1/work-orders', () => {
    it('should return paginated work orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/work-orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/work-orders/active', () => {
    it('should return active work orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/work-orders/active')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/v1/work-orders/:id', () => {
    it('should return work order by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/work-orders/${createdWorkOrderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdWorkOrderId);
    });

    it('should return 404 for non-existent id', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/work-orders/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/work-orders/:id/close', () => {
    it('should close a work order', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/work-orders/${createdWorkOrderId}/close`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          qty_completed: 95,
          qty_rejected: 5,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.current_status).toBe('closed');
    });
  });
});
