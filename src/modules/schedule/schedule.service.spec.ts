import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScheduleService } from './schedule.service';
import {
  ScheduleData,
  ScheduleFile,
  CompanyColumnMapping,
} from '../../database/entities';
import { Department } from '../../database/entities/department.entity';
import { SystemConfiguration } from '../../database/entities/system-configuration.entity';
import { TimeSegment } from '../../database/entities/time-segment.entity';
import * as columnMappingUtils from '../../utils/column-mapping';

jest.mock('../../utils/column-mapping', () => {
  const actual = jest.requireActual('../../utils/column-mapping');
  return {
    ...actual,
    transformToScheduleData: jest.fn((...args) => actual.transformToScheduleData(...args)),
  };
});

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
            upsert: jest.fn(),
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
        metadata: {
          size: 201060,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
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
    it('should return an array of schedule column mappings with camelCase and woId', async () => {
      const mockMapping = {
        companyId,
        normalizationRules: {
          Status: 'status',
          'Due Date': 'due_date', // old snake_case in DB
        },
      };

      columnMappingRepo.findOne.mockResolvedValue(mockMapping);

      const result = await service.getScheduleColumns(companyId);

      expect(Array.isArray(result)).toBe(true);
      
      // Should include woId even if not in normalizationRules
      const woIdCol = result.find(c => c.normalizedName === 'woId');
      expect(woIdCol).toBeDefined();
      expect(woIdCol.excelName).toBe('Work Order ID');

      // Should convert existing snake_case in DB to camelCase
      const dueDateCol = result.find(c => c.normalizedName === 'dueDate');
      expect(dueDateCol).toBeDefined();
      expect(dueDateCol.excelName).toBe('Due Date');
    });
  });

  describe('importSchedule', () => {
    it('should call transformToScheduleData with rawData as 5th argument', async () => {
      const userId = 'user-1';
      const mockFile = {
        buffer: Buffer.from('dummy content'),
      } as Express.Multer.File;

      // Mock XLSX to return one row
      const XLSX = require('xlsx');
      jest.spyOn(XLSX, 'read').mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      });
      jest.spyOn(XLSX.utils, 'sheet_to_json').mockReturnValue([
        { 'Work Order ID': 'WO-1', 'Due Date': '2026-02-15' }
      ]);

      columnMappingRepo.findOne.mockResolvedValue({
        id: 'mapping-1',
        normalizationRules: { 'Work Order ID': 'woId', 'Due Date': 'dueDate' },
        save: jest.fn()
      });
      columnMappingRepo.update.mockResolvedValue({});
      
      const scheduleDataRepo = (service as any).scheduleDataRepository;
      scheduleDataRepo.count.mockResolvedValue(0);
      scheduleDataRepo.upsert.mockResolvedValue({});

      await service.importSchedule(companyId, userId, mockFile);

      expect(columnMappingUtils.transformToScheduleData).toHaveBeenCalledWith(
        expect.any(Object),
        companyId,
        undefined,
        expect.any(String),
        expect.objectContaining({ 'Work Order ID': 'WO-1' })
      );
    });
  });
});
