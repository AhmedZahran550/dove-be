import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationsService } from './locations.service';
import { Location } from '../../database/entities/location.entity';
import { CreateLocationDto } from './dto/location.dto';

describe('LocationsService', () => {
  let service: LocationsService;
  let repository: Repository<Location>;

  const mockRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(entity => Promise.resolve({ id: 'uuid', ...entity })),
    update: jest.fn().mockResolvedValue(undefined),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: getRepositoryToken(Location),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    repository = module.get<Repository<Location>>(getRepositoryToken(Location));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should map DTO fields correctly to Location entity', async () => {
      const dto: any = {
        name: 'Main Plant',
        code: 'MAIN_PLANT',
        address: '123 Street',
        city: 'Toronto',
        state: 'ON',
        postalCode: 'M1M1M1',
        adminEmail: 'admin@example.com',
        shifts: [
          { name: 'Shift 1', start: '08:00 AM', end: '04:00 PM' }
        ],
        company: { id: 'company-uuid' },
      };

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
        name: dto.name,
        code: dto.code,
        addressLine1: dto.address,
        city: dto.city,
        stateProvince: dto.state,
        postalCode: dto.postalCode,
        managerEmail: dto.adminEmail,
        shifts: dto.shifts,
        companyId: dto.company.id,
      }));
      
      // Check that "email" column is NOT used (Red check: current service uses email)
      const callArgs = (repository.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.email).toBeUndefined();
    });
  });
});
