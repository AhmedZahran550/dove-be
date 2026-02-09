import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScheduleService } from './schedule.service';
import { ScheduleData, ScheduleFile, CompanyColumnMapping } from '../../database/entities';
import { Department } from '../../database/entities/department.entity';
import { SystemConfiguration } from '../../database/entities/system-configuration.entity';
import { TimeSegment } from '../../database/entities/time-segment.entity';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let scheduleFileRepo: any;
  let systemConfigRepo: any;
  let columnMappingRepo: any;

  const companyId = '88eb611d-db0a-49e4-a420-8e448aebe5d5';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: getRepositoryToken(ScheduleData),
          useValue: {
            findAndCount: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ScheduleFile),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CompanyColumnMapping),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Department),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SystemConfiguration),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TimeSegment),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    scheduleFileRepo = module.get(getRepositoryToken(ScheduleFile));
    systemConfigRepo = module.get(getRepositoryToken(SystemConfiguration));
    columnMappingRepo = module.get(getRepositoryToken(CompanyColumnMapping));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getScheduleSyncConfig', () => {
    it('should return the schedule file wrapped in success and scheduleFile object', async () => {
      const mockActiveFile = {
        id: '6eb3948b-84f8-4443-a594-9e5f9e6a482d',
        companyId,
        fileName: 'demo-schedule.xlsx',
        sourceType: 'file_system',
        syncFrequency: 'hourly',
        autoSyncEnabled: true,
        publishToSchedulePage: true,
        isActive: true,
        lastSyncedAt: new Date('2026-02-09T15:16:13.831Z'),
        metadata: { size: 201060, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        uploadedBy: 'c94a3549-c3d6-4518-8d33-8ff3882ec4ad',
        createdAt: new Date('2026-02-07T19:25:38.480Z'),
        updatedAt: new Date('2026-02-09T15:16:13.860Z'),
      };

      scheduleFileRepo.findOne.mockResolvedValue(mockActiveFile);
      systemConfigRepo.findOne.mockResolvedValue({ configValue: 'success' });

      const result = await service.getScheduleSyncConfig(companyId);

      expect(result.success).toBe(true);
      expect(result.scheduleFile).toBeDefined();
      expect(result.scheduleFile.id).toBe(mockActiveFile.id);
      expect(result.scheduleFile.fileName).toBe(mockActiveFile.fileName);
      expect(result.scheduleFile.metadata).toEqual(mockActiveFile.metadata);
      // These fields are expected based on spec but might not be in entity yet
      expect(result.scheduleFile).toHaveProperty('lastSyncStatus');
    });
  });

  describe('getScheduleColumns', () => {
    it('should return the schedule columns with success flag and debug info', async () => {
      const mockMapping = {
        companyId,
        normalizationRules: {
          'Status': 'status',
          'Remarks': 'remarks',
        },
      };

      columnMappingRepo.findOne.mockResolvedValue(mockMapping);

      const result = await service.getScheduleColumns(companyId);

      expect(result.success).toBe(true);
      expect(result.scheduleDataColumns).toBeDefined();
      expect(Array.isArray(result.scheduleDataColumns)).toBe(true);
      expect(result.normalizationRules).toEqual(mockMapping.normalizationRules);
      expect(result._debug).toBeDefined();
      expect(result._debug.company_id).toBe(companyId);
    });
  });
});
