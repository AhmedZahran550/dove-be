import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { VerificationCode, VerificationCodeType } from '../../database/entities';
import { addMinutes, isAfter } from 'date-fns';

@Injectable()
export class VerificationCodeService {
  constructor(
    @InjectRepository(VerificationCode)
    private verificationCodeRepository: Repository<VerificationCode>,
  ) {}

  /**
   * Generate a random 6-character alphanumeric code
   */
  private generateCode(length = 6): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars like I, O, 0, 1
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Create a new verification code for a user
   */
  async createCode(
    userId: string,
    type: VerificationCodeType = VerificationCodeType.EMAIL_VERIFICATION,
  ): Promise<VerificationCode> {
    // Check for rate limiting (e.g., 60 seconds)
    const lastCode = await this.verificationCodeRepository.findOne({
      where: { userId, type },
      order: { createdAt: 'DESC' },
    });

    if (lastCode) {
      const cooldownTime = 60 * 1000; // 60 seconds
      const timeSinceLast = Date.now() - lastCode.createdAt.getTime();
      
      if (timeSinceLast < cooldownTime) {
        const remaining = Math.ceil((cooldownTime - timeSinceLast) / 1000);
        throw new BadRequestException(`Please wait ${remaining} seconds before requesting a new code.`);
      }
    }

    // Deactivate previous codes
    await this.verificationCodeRepository.update(
      { userId, type, isUsed: false },
      { isUsed: true },
    );

    const code = this.generateCode();
    const expiresAt = addMinutes(new Date(), 10);

    const newCode = this.verificationCodeRepository.create({
      userId,
      code,
      type,
      expiresAt,
      isUsed: false,
    });

    return this.verificationCodeRepository.save(newCode);
  }

  /**
   * Verify a code
   */
  async verifyCode(
    userId: string,
    code: string,
    type: VerificationCodeType = VerificationCodeType.EMAIL_VERIFICATION,
  ): Promise<boolean> {
    const validCode = await this.verificationCodeRepository.findOne({
      where: {
        userId,
        code,
        type,
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!validCode) {
      return false;
    }

    // Mark as used
    await this.verificationCodeRepository.update(validCode.id, { isUsed: true });
    
    return true;
  }
}
