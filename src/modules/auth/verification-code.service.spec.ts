import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VerificationCode, VerificationCodeType } from '../../database/entities';
import { VerificationCodeService } from './verification-code.service';
import { BadRequestException } from '@nestjs/common';
import { addMinutes, subMinutes } from 'date-fns';

describe('VerificationCodeService', () => {
  let service: VerificationCodeService;
  let repo: any;

  const mockRepo = {
    findOne: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationCodeService,
        {
          provide: getRepositoryToken(VerificationCode),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<VerificationCodeService>(VerificationCodeService);
    repo = module.get(getRepositoryToken(VerificationCode));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCode', () => {
    it('should create a new code if no previous code exists', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue({ id: 'new-id' });
      repo.save.mockResolvedValue({ code: 'ABC123' });

      const result = await service.createCode('user-id');

      expect(repo.update).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if requested too soon', async () => {
      repo.findOne.mockResolvedValue({ createdAt: new Date() });

      await expect(service.createCode('user-id')).rejects.toThrow(BadRequestException);
    });

    it('should create a new code if cooldown has passed', async () => {
      repo.findOne.mockResolvedValue({ createdAt: subMinutes(new Date(), 2) });
      repo.create.mockReturnValue({});
      repo.save.mockResolvedValue({ code: 'ABC123' });

      await service.createCode('user-id');

      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('verifyCode', () => {
    it('should return true and mark as used for a valid code', async () => {
      repo.findOne.mockResolvedValue({ id: 'code-id' });

      const result = await service.verifyCode('user-id', 'ABC123');

      expect(result).toBe(true);
      expect(repo.update).toHaveBeenCalledWith('code-id', { isUsed: true });
    });

    it('should return false for an invalid or expired code', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.verifyCode('user-id', 'WRONG');

      expect(result).toBe(false);
      expect(repo.update).not.toHaveBeenCalled();
    });
  });
});
