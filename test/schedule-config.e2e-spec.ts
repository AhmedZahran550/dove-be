import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { Role } from '../src/modules/auth/role.model';
import { JwtService } from '@nestjs/jwt';
import { User } from '../src/database/entities/user.entity';
import { ScheduleService } from '../src/modules/schedule/schedule.service';
import { ScheduleFile } from '../src/database/entities';

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

describe('Schedule Configuration and Sync (e2e)', () => {
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
    jest
      .spyOn(scheduleService, 'getScheduleSyncConfig')
      .mockImplementation(async (companyId: string) => {
        const mockScheduleFile: Partial<ScheduleFile> = {
          id: 'schedule-file-uuid',
          fileName: 'mock_schedule.xlsx',
          sourceType: 'file_upload',
          syncFrequency: 'hourly',
          autoSyncEnabled: true,
        };
        return {
          success: true,
          scheduleFile: {
            ...mockScheduleFile,
            lastSyncStatus: 'success',
            lastSyncError: null,
            syncRetryCount: 0,
            nextRetryAt: null,
            emailNotifications: true,
            automaticBackups: true,
          },
        };
      });
    jest
      .spyOn(scheduleService, 'triggerScheduleSync')
      .mockResolvedValue({ success: true, message: 'Sync started' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /schedule/config should return schedule sync configuration for ADMIN role', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/schedule/config')
      .set('Authorization', 'Bearer mock-jwt-token')
      .expect(200);

    expect(res.body).toEqual({
      success: true,
      scheduleFile: {
        id: 'schedule-file-uuid',
        fileName: 'mock_schedule.xlsx',
        sourceType: 'file_upload',
        syncFrequency: 'hourly',
        autoSyncEnabled: true,
        lastSyncStatus: 'success',
        lastSyncError: null,
        syncRetryCount: 0,
        nextRetryAt: null,
        emailNotifications: true,
        automaticBackups: true,
      },
    });
  });

  it('POST /schedule/sync should trigger manual schedule sync for ADMIN role', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/schedule/sync')
      .set('Authorization', 'Bearer mock-jwt-token')
      .expect(200);

    expect(res.body).toEqual({
      success: true,
      message: 'Sync started',
    });
    expect(scheduleService.triggerScheduleSync).toHaveBeenCalledWith(
      'test-company-uuid',
    );
  });
});
