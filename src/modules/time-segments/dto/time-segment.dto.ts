import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTimeSegmentDto {
  @ApiProperty()
  @IsUUID()
  workOrderId: string;

  @ApiProperty()
  @IsUUID()
  operatorId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  operatorAssId?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  segmentType?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  shiftId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shiftDate?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  equipmentId?: string;
}

export class UpdateTimeSegmentDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  durationMinutes?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  qtyProduced?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  qtyRejected?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  segmentType?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  downtimeReasonId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  downtimeCategory?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  downtimeNotes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  breakType?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class EndTimeSegmentDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  qtyProduced?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  qtyRejected?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
