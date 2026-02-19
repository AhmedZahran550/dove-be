import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { Role } from '../src/modules/auth/role.model';
import { JwtService } from '@nestjs/jwt';
import { ScheduleService } from '../src/modules/schedule/schedule.service';
import { ConnectorDto } from '../src/modules/schedule/dto/sync-agent.dto';

// Mock AuthGuard to bypass authentication
const mockAuthGuard = {
  canActivate: jest.fn((context) => {
    const request = context.switchToHttp().getRequest();
    // Simulate an authenticated admin user
    request.user = {
      id: 'admin-user-uuid',
      companyId: 'test-company-uuid',
      roles: [Role.ADMIN],
    };
    return true;
  }),
};

// Mock JwtService
const mockJwtService = {
  sign: jest.fn(() => 'mock-jwt-token'),
};

describe('Connectors (e2e)', () => {
  let app: INestApplication;
  let scheduleService: ScheduleService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    scheduleService = moduleFixture.get<ScheduleService>(ScheduleService);
    // Mock the service method to return consistent data for testing
    jest.spyOn(scheduleService, 'getAvailableConnectors').mockImplementation(
      async (companyId: string): Promise<ConnectorDto[]> => {
        return [
          {
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Production DB',
            connectorTypeId: 'postgresql',
            connectionStatus: 'connected',
            lastSyncedAt: '2023-10-27T10:00:00Z',
          },
        ];
      },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /connectors should return available connectors for ADMIN role', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/connectors')
      .set('Authorization', 'Bearer mock-jwt-token')
      .expect(200);

    expect(res.body).toEqual({
      success: true,
      connectors: [
        {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Production DB',
          connectorTypeId: 'postgresql',
          connectionStatus: 'connected',
          lastSyncedAt: '2023-10-27T10:00:00Z',
        },
      ],
    });
    expect(scheduleService.getAvailableConnectors).toHaveBeenCalledWith(
      'test-company-uuid',
    );
  });
});
