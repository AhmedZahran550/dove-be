import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingCycle } from '@/database/entities/subscription.entity';

export class CreateCheckoutDto {
  @ApiProperty({ description: 'Plan ID to subscribe to' })
  @IsString()
  planId: string;

  @ApiPropertyOptional({
    description: 'Billing cycle',
    enum: BillingCycle,
    default: BillingCycle.MONTHLY,
  })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @ApiPropertyOptional({
    description: 'Success URL for redirect after payment',
  })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiPropertyOptional({
    description: 'Cancel URL for redirect if payment canceled',
  })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
