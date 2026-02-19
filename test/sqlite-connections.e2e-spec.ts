import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { Role } from '../src/modules/auth/role.model';
import { JwtService } from '@nestjs/jwt';
import { ScheduleService } from '../src/modules/schedule/schedule.service';
import {
  SqliteConnectionDto,
  UpdateSqliteConnectionDto,
} from '../src/modules/schedule/dto/sync-agent.dto';

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

describe('SQLite Connections (e2e)', () => {
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
    // Mock the service methods to return consistent data for testing
    jest.spyOn(scheduleService, 'getSqliteConnections').mockImplementation(
      async (companyId: string): Promise<SqliteConnectionDto[]> => {
        return [
          {
            id: '00000000-0000-0000-0000-000000000002',
            connectionName: 'Local Machine 1',
            lastSchemaUpdate: '2023-10-27T10:00:00Z',
            selectedTable: 'orders',
            trackingColumn: 'updated_at',
            discoveredTables: {
              orders: {
                rowCount: 1500,
                columns: [
                  { name: 'id', type: 'INTEGER' },
                  { name: 'order_date', type: 'TEXT' },
                  { name: 'updated_at', type: 'TEXT' },
                ],
              },
              products: {
                rowCount: 50,
                columns: [{ name: 'id', type: 'INTEGER' }, { name: 'name', type: 'TEXT' }],
              },
            },
          },
        ];
      },
    );
    jest
      .spyOn(scheduleService, 'updateSqliteConnection')
      .mockResolvedValue({ success: true, message: 'Configuration saved' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /sqlite/connections should return SQLite connections for ADMIN role', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/sqlite/connections')
      .set('Authorization', 'Bearer mock-jwt-token')
      .expect(200);

    expect(res.body).toEqual({
      success: true,
      connections: [
        {
          id: '00000000-0000-0000-0000-000000000002',
          connectionName: 'Local Machine 1',
          lastSchemaUpdate: '2023-10-27T10:00:00Z',
          selectedTable: 'orders',
          trackingColumn: 'updated_at',
          discoveredTables: {
            orders: {
              rowCount: 1500,
              columns: [
                { name: 'id', type: 'INTEGER' },
                { name: 'order_date', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' },
              ],
            },
            products: {
              rowCount: 50,
              columns: [{ name: 'id', type: 'INTEGER' }, { name: 'name', type: 'TEXT' }],
            },
          },
        },
      ],
    });
    expect(scheduleService.getSqliteConnections).toHaveBeenCalledWith(
      'test-company-uuid',
    );
  });

  it('PUT /sqlite/connections should update SQLite connection configuration for ADMIN role', async () => {
    const updateDto: UpdateSqliteConnectionDto = {
      id: '00000000-0000-0000-0000-000000000002',
      selectedTable: 'products',
      trackingColumn: 'created_at',
    };

    const res = await request(app.getHttpServer())
      .put('/api/v1/sqlite/connections')
      .set('Authorization', 'Bearer mock-jwt-token')
      .send(updateDto)
      .expect(200);

    expect(res.body).toEqual({
      success: true,
      message: 'Configuration saved',
    });
    expect(scheduleService.updateSqliteConnection).toHaveBeenCalledWith(
      'test-company-uuid',
      updateDto,
    );
  });
});
