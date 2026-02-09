import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrder } from '../../database/entities';
import { Location } from '../../database/entities';

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;
  let mockWorkOrderRepo: any;
  let mockLocationRepo: any;

  const mockWorkOrder = {
    id: 'wo-uuid',
    company_id: 'company-uuid',
    location_id: 'location-uuid',
    wo_number: 'WO-001',
    wo_qty: 100,
    current_status: 'running',
    start_time: new Date(),
    closing_time: undefined,
    created_at: new Date(),
  };

  const mockLocation = {
    id: 'location-uuid',
    company_id: 'company-uuid',
    name: 'Main Factory',
    is_active: true,
  };

  beforeEach(async () => {
    mockWorkOrderRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn((data) => ({ id: 'wo-uuid', ...data })),
      save: jest.fn((wo) => Promise.resolve(wo)),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      remove: jest.fn().mockResolvedValue(mockWorkOrder),
    };

    mockLocationRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: getRepositoryToken(WorkOrder), useValue: mockWorkOrderRepo },
        { provide: getRepositoryToken(Location), useValue: mockLocationRepo },
      ],
    }).compile();

    service = module.get<WorkOrdersService>(WorkOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      wo_id: 'WO-001',
      wo_qty: 100,
    };

    it('should create a new work order', async () => {
      mockWorkOrderRepo.findOne.mockResolvedValue(null);
      mockLocationRepo.findOne.mockResolvedValue(mockLocation);

      const result = await service.create('company-uuid', createDto);

      expect(result).toHaveProperty('id');
      expect(mockWorkOrderRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if work order already active', async () => {
      mockWorkOrderRepo.findOne.mockResolvedValue(mockWorkOrder);

      await expect(service.create('company-uuid', createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if no active location', async () => {
      mockWorkOrderRepo.findOne.mockResolvedValue(null);
      mockLocationRepo.findOne.mockResolvedValue(null);

      await expect(service.create('company-uuid', createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated work orders', async () => {
      mockWorkOrderRepo.findAndCount.mockResolvedValue([[mockWorkOrder], 1]);

      const result = await service.findAll('company-uuid', {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.currentPage).toBe(1);
    });
  });

  describe('findActive', () => {
    it('should return only active (unclosed) work orders', async () => {
      mockWorkOrderRepo.find.mockResolvedValue([mockWorkOrder]);

      const result = await service.findActive('company-uuid');

      expect(result).toHaveLength(1);
      expect(result[0].closing_time).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should return work order by id', async () => {
      mockWorkOrderRepo.findOne.mockResolvedValue(mockWorkOrder);

      const result = await service.findById('wo-uuid', 'company-uuid');

      expect(result.id).toBe('wo-uuid');
    });

    it('should throw NotFoundException if not found', async () => {
      mockWorkOrderRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findById('wrong-uuid', 'company-uuid'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('close', () => {
    it('should close a work order', async () => {
      mockWorkOrderRepo.findOne
        .mockResolvedValueOnce(mockWorkOrder)
        .mockResolvedValueOnce({
          ...mockWorkOrder,
          closing_time: new Date(),
          current_status: 'closed',
        });

      const result = await service.close('wo-uuid', 'company-uuid', {
        qty_completed: 95,
        qty_rejected: 5,
      });

      expect(mockWorkOrderRepo.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if already closed', async () => {
      const closedWo = { ...mockWorkOrder, closing_time: new Date() };
      mockWorkOrderRepo.findOne.mockResolvedValue(closedWo);

      await expect(
        service.close('wo-uuid', 'company-uuid', {}),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a work order', async () => {
      mockWorkOrderRepo.findOne.mockResolvedValue(mockWorkOrder);

      await service.delete('wo-uuid', 'company-uuid');

      expect(mockWorkOrderRepo.remove).toHaveBeenCalled();
    });
  });
});
