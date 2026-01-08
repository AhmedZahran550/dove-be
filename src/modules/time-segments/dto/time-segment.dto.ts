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
  work_order_id: string;

  @ApiProperty()
  @IsUUID()
  operator_id: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  operator_ass_id?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  start_time?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  segment_type?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  shift_id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shift_date?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  equipment_id?: string;
}

export class UpdateTimeSegmentDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  end_time?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  duration_minutes?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  qty_produced?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  qty_rejected?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  segment_type?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  downtime_reason_id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  downtime_category?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  downtime_notes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  break_type?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class EndTimeSegmentDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  end_time?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  qty_produced?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  qty_rejected?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

