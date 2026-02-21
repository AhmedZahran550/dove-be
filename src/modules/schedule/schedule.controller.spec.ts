import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { User } from '../../database/entities/user.entity';

describe('ScheduleController', () => {
  let controller: ScheduleController;
  let service: ScheduleService;

  const mockUser = {
    id: 'user-uuid',
    companyId: 'company-uuid',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        {
          provide: ScheduleService,
          useValue: {
            getScheduleSyncConfig: jest.fn(),
            getScheduleColumns: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ScheduleController>(ScheduleController);
    service = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getScheduleSyncConfig', () => {
    it('should return the service result', async () => {
      const mockResult = {
        success: true,
        scheduleFile: { id: 'file-id' },
      };
      (service.getScheduleSyncConfig as jest.Mock).mockResolvedValue(
        mockResult,
      );

      const result = await controller.getScheduleSyncConfig(mockUser);

      expect(result).toEqual(mockResult);
      expect(service.getScheduleSyncConfig).toHaveBeenCalledWith(
        mockUser.companyId,
      );
    });
  });

  describe('getScheduleColumns', () => {
    it('should return columns wrapped in { data }', async () => {
      const mockColumns = [{ excelName: 'Status', normalizedName: 'status' }];
      (service.getScheduleColumns as jest.Mock).mockResolvedValue(mockColumns);

      const result = await controller.getScheduleColumns(mockUser);

      expect(result).toEqual({ data: mockColumns });
      expect(service.getScheduleColumns).toHaveBeenCalledWith(
        mockUser.companyId,
      );
    });
  });
});
