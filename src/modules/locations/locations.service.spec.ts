import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationsService } from './locations.service';
import { Location } from '../../database/entities/location.entity';
import { CreateLocationDto } from './dto/location.dto';
import { InvitationsService } from '../invitations/invitations.service';
import { Role } from '../auth/role.model';

describe('LocationsService', () => {
  let service: LocationsService;
  let repository: Repository<Location>;
  let invitationsService: InvitationsService;

  const mockRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(entity => Promise.resolve({ id: 'location-uuid', ...entity })),
    update: jest.fn().mockResolvedValue(undefined),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockInvitationsService = {
    createInvitation: jest.fn().mockResolvedValue({ id: 'invitation-uuid' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: getRepositoryToken(Location),
          useValue: mockRepository,
        },
        {
          provide: InvitationsService,
          useValue: mockInvitationsService,
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    repository = module.get<Repository<Location>>(getRepositoryToken(Location));
    invitationsService = module.get<InvitationsService>(InvitationsService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should map DTO fields correctly to Location entity and send invitation', async () => {
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

      const user: any = { id: 'user-uuid', companyId: 'company-uuid' };
      const result = await service.create(dto, { user });

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
      
      // Verification for Invitation triggering
      expect(invitationsService.createInvitation).toHaveBeenCalledWith(
        dto.company.id,
        user,
        expect.objectContaining({
          email: dto.adminEmail,
          role: Role.LOCATION_ADMIN,
          locationId: 'location-uuid',
        })
      );
    });

    it('should NOT send invitation if adminEmail is NOT provided', async () => {
      const dto: any = {
        name: 'No Admin Plant',
        code: 'NO_ADMIN',
        company: { id: 'company-uuid' },
      };

      await service.create(dto, { user: { id: 'user-uuid' } as any });

      expect(invitationsService.createInvitation).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should send invitation if adminEmail is changed', async () => {
      const location = { id: 'location-uuid', companyId: 'company-uuid', managerEmail: 'old@example.com' };
      mockRepository.findOne.mockResolvedValue(location);
      
      const dto: any = { adminEmail: 'new@example.com' };
      const user: any = { id: 'user-uuid' };
      
      await service.update('location-uuid', dto, { user });
      
      expect(invitationsService.createInvitation).toHaveBeenCalledWith(
        'company-uuid',
        user,
        expect.objectContaining({
          email: 'new@example.com',
          role: Role.LOCATION_ADMIN,
          locationId: 'location-uuid',
        })
      );
    });

    it('should NOT send invitation if adminEmail is the same', async () => {
      const location = { id: 'location-uuid', companyId: 'company-uuid', managerEmail: 'same@example.com' };
      mockRepository.findOne.mockResolvedValue(location);
      
      const dto: any = { adminEmail: 'same@example.com' };
      
      await service.update('location-uuid', dto, { user: { id: 'user-uuid' } as any });
      
      expect(invitationsService.createInvitation).not.toHaveBeenCalled();
    });
  });
});
