import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDateString,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWorkOrderDto {
  @ApiProperty({ example: 'WO-2024-001' })
  @IsString()
  @IsNotEmpty()
  wo_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  wo_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  part_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lot_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bulk_lot_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  wo_qty?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  equipment_id?: string;

  @ApiPropertyOptional({ description: 'Setup time in HH:MM format' })
  @IsOptional()
  @IsString()
  setup_time?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  start_time?: string;

  @ApiPropertyOptional({ description: 'Array of operator UUIDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  operators?: string[];
}

export class UpdateWorkOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  qty_completed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  qty_rejected?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  current_status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  status_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  operator_comment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lead_hand_comment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supervisor_comment?: string;

  statusUpdatedBy?: string;

  statusUpdatedAt?: Date;
}

export class CloseWorkOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  qty_completed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  qty_rejected?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  operator_comment?: string;
}

export class WorkOrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  wo_number: string;

  @ApiProperty()
  company_id: string;

  @ApiProperty()
  location_id: string;

  @ApiProperty()
  wo_qty: number;

  @ApiProperty()
  current_status: string;

  @ApiPropertyOptional()
  start_time?: Date;

  @ApiPropertyOptional()
  closing_time?: Date;

  @ApiProperty()
  created_at: Date;
}
