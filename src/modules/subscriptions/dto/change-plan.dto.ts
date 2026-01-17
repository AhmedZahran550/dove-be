import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingCycle } from '@/database/entities/subscription.entity';

export class ChangePlanDto {
  @ApiProperty({ description: 'New plan ID to switch to' })
  @IsString()
  planId: string;

  @ApiPropertyOptional({
    description: 'Billing cycle for the new plan',
    enum: BillingCycle,
  })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;
}
