import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({ description: 'Unique plan code', example: 'starter' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Display name', example: 'Starter Plan' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Monthly price', example: 9.99 })
  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @ApiProperty({ description: 'Yearly price', example: 99.99 })
  @IsNumber()
  @Min(0)
  yearlyPrice: number;

  @ApiPropertyOptional({
    description: 'Trial days for free trial plan',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  trialDays?: number;

  @ApiPropertyOptional({
    description: 'List of feature codes',
    example: ['api_access', 'reports'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ description: 'Maximum users allowed', default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsers?: number;

  @ApiPropertyOptional({ description: 'Maximum locations allowed', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxLocations?: number;

  @ApiPropertyOptional({
    description: 'Whether this is a free trial plan',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFreeTrial?: boolean;

  @ApiPropertyOptional({ description: 'Stripe price ID for monthly billing' })
  @IsOptional()
  @IsString()
  stripePriceIdMonthly?: string;

  @ApiPropertyOptional({ description: 'Stripe price ID for yearly billing' })
  @IsOptional()
  @IsString()
  stripePriceIdYearly?: string;

  @ApiPropertyOptional({ description: 'Sort order for display', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
