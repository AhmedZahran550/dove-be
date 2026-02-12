import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  IsUUID,
  MaxLength,
  Min,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

/**
 * DTO for schedule data query filters
 */
export class ScheduleDataQueryDto {
  @ApiPropertyOptional({ description: 'Filter by department' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by schedule file ID' })
  @IsOptional()
  @IsUUID()
  scheduleFileId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

/**
 * DTO for creating a schedule file
 */
export class CreateScheduleFileDto {
  @ApiProperty({ description: 'File name' })
  @IsString()
  @MaxLength(255)
  fileName: string;

  @ApiPropertyOptional({ description: 'File path' })
  @IsOptional()
  @IsString()
  filePath?: string;

  @ApiPropertyOptional({ description: 'File URL' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Source type', default: 'database' })
  @IsOptional()
  @IsString()
  @IsIn(['database', 'file', 'api'])
  sourceType?: string;

  @ApiPropertyOptional({ description: 'Sync frequency', default: 'hourly' })
  @IsOptional()
  @IsString()
  @IsIn(['manual', 'hourly', 'daily', 'weekly'])
  syncFrequency?: string;

  @ApiPropertyOptional({ description: 'Enable auto sync', default: true })
  @IsOptional()
  @IsBoolean()
  autoSyncEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Publish to schedule page',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  publishToSchedulePage?: boolean;
}

/**
 * DTO for updating a schedule file
 */
export class UpdateScheduleFileDto extends PartialType(CreateScheduleFileDto) {
  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * DTO for creating schedule data
 */
export class CreateScheduleDataDto {
  @ApiProperty({ description: 'Work order ID' })
  @IsString()
  @MaxLength(100)
  woId: string;

  @ApiPropertyOptional({ description: 'Work order number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  woNumber?: string;

  @ApiPropertyOptional({ description: 'Department' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  status?: string;

  @ApiPropertyOptional({ description: 'Part number' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  partNumber?: string;

  @ApiPropertyOptional({ description: 'Quantity open' })
  @IsOptional()
  @IsInt()
  @Min(0)
  qtyOpen?: number;

  @ApiPropertyOptional({ description: 'Sequence number' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sequence?: number;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Release date' })
  @IsOptional()
  @IsString()
  releaseDate?: string;
}

/**
 * DTO for updating schedule data
 */
export class UpdateScheduleDataDto extends PartialType(CreateScheduleDataDto) {}
