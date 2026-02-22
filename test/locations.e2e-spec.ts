import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { Role } from '../src/modules/auth/role.model';

describe('Locations E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let companyId: string;

  const testEmail = `loc-test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  beforeAll(async () => {
    const { AuthModule } = await import('../src/modules/auth/auth.module');
    const { UsersModule } = await import('../src/modules/users/users.module');
    const { CompaniesModule } = await import('../src/modules/companies/companies.module');
    const { LocationsModule } = await import('../src/modules/locations/locations.module');
    const { InvitationsModule } = await import('../src/modules/invitations/invitations.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST || 'localhost',
          port: parseInt(process.env.DATABASE_PORT || '5433'),
          username: process.env.DATABASE_USERNAME || 'postgres',
          password: process.env.DATABASE_PASSWORD || 'postgres123',
          database: process.env.DATABASE_NAME || 'dova_test',
          autoLoadEntities: true,
          synchronize: true,
        }),
        JwtModule.register({
          secret: process.env.JWT_ACCESS_SECRET || 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        AuthModule,
        UsersModule,
        CompaniesModule,
        LocationsModule,
        InvitationsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix('api/v1');
    await app.init();

    // Register and login to get token
    const regResp = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Location Test User',
        email: testEmail,
        phone: '1234567890',
        organizationName: `Loc Org ${Date.now()}`,
        password: testPassword,
      });
    
    accessToken = regResp.body.access_token;
    
    // Get companyId from profile
    const profileResp = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    
    companyId = profileResp.body.companyId;
  }, 90000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/locations', () => {
    it('should create a location with shifts and trigger invitation', async () => {
      const adminEmail = `admin-${Date.now()}@example.com`;
      const payload = {
        name: 'Main Manufacturing Plant',
        code: 'MAIN_MANU_PLANT',
        address: '123 Factory Row',
        city: 'Toronto',
        state: 'ON',
        postalCode: 'M1M 1M1',
        adminEmail: adminEmail,
        shifts: [
          { name: 'First Shift', start: '08:00 AM', end: '04:00 PM' },
          { name: 'Second Shift', start: '04:00 PM', end: '12:00 AM' }
        ]
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(payload.name);
      expect(response.body.shifts).toHaveLength(2);
      expect(response.body.managerEmail).toBe(adminEmail);
      
      // Verify invitation was created (via Invitations API if exists)
      // For now we check if it was accepted in service tests, 
      // here we can try to GET /api/v1/invitations if it's implemented.
    });

    it('should fail with invalid shift format', async () => {
      const payload = {
        name: 'Invalid Plant',
        code: 'INVALID_CODE',
        shifts: [
          { name: 'Bad Shift', start: '08:00', end: '16:00' }
        ]
      };

      await request(app.getHttpServer())
        .post('/api/v1/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);
    });
  });

  describe('PATCH /api/v1/locations/:id', () => {
    it('should update location shifts', async () => {
      // First create a location
      const createResp = await request(app.getHttpServer())
        .post('/api/v1/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Update Plant',
          code: 'UPDATE_PLANT',
          shifts: [{ name: 'S1', start: '09:00 AM', end: '05:00 PM' }]
        });
      
      const locationId = createResp.body.id;

      const updatePayload = {
        shifts: [
          { name: 'New Shift', start: '06:00 AM', end: '02:00 PM' }
        ]
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/locations/${locationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePayload)
        .expect(200);

      expect(response.body.shifts).toHaveLength(1);
      expect(response.body.shifts[0].name).toBe('New Shift');
    });
  });
});
