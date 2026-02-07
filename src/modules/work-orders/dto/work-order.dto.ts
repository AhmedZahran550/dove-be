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
  woId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  woNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  partNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lotNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bulkLotNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  woQty?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  equipmentId?: string;

  @ApiPropertyOptional({ description: 'Process step UUID' })
  @IsOptional()
  @IsString()
  processStepId?: string;

  @ApiPropertyOptional({ description: 'Setup time in HH:MM format' })
  @IsOptional()
  @IsString()
  setupTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startTime?: string;

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
  qtyCompleted?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  qtyRejected?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  statusId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  operatorComment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leadHandComment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supervisorComment?: string;

  statusUpdatedBy?: string;

  statusUpdatedAt?: Date;
}

export class CloseWorkOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  qtyCompleted?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  qtyRejected?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  operatorComment?: string;
}

export class WorkOrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  woNumber: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  locationId: string;

  @ApiProperty()
  woQty: number;

  @ApiProperty()
  currentStatus: string;

  @ApiPropertyOptional()
  startTime?: Date;

  @ApiPropertyOptional()
  closingTime?: Date;

  @ApiProperty()
  createdAt: Date;
}
