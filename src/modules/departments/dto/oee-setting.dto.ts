import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOeeSettingDto {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  qcRequired?: boolean;

  @ApiProperty({ example: 85.0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  availabilityGoal: number;

  @ApiProperty({ example: 90.0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  performanceGoal: number;

  @ApiProperty({ example: 95.0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  qualityGoal: number;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  @IsNotEmpty()
  effectiveFrom: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateOeeSettingDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  qcRequired?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  availabilityGoal?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  performanceGoal?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  qualityGoal?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
