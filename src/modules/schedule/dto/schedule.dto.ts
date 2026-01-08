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
  schedule_file_id?: string;

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
  file_name: string;

  @ApiPropertyOptional({ description: 'File path' })
  @IsOptional()
  @IsString()
  file_path?: string;

  @ApiPropertyOptional({ description: 'File URL' })
  @IsOptional()
  @IsString()
  file_url?: string;

  @ApiPropertyOptional({ description: 'Source type', default: 'database' })
  @IsOptional()
  @IsString()
  @IsIn(['database', 'file', 'api'])
  source_type?: string;

  @ApiPropertyOptional({ description: 'Sync frequency', default: 'hourly' })
  @IsOptional()
  @IsString()
  @IsIn(['manual', 'hourly', 'daily', 'weekly'])
  sync_frequency?: string;

  @ApiPropertyOptional({ description: 'Enable auto sync', default: true })
  @IsOptional()
  @IsBoolean()
  auto_sync_enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Publish to schedule page',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  publish_to_schedule_page?: boolean;
}

/**
 * DTO for updating a schedule file
 */
export class UpdateScheduleFileDto extends PartialType(CreateScheduleFileDto) {
  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

/**
 * DTO for creating schedule data
 */
export class CreateScheduleDataDto {
  @ApiProperty({ description: 'Work order ID' })
  @IsString()
  @MaxLength(100)
  wo_id: string;

  @ApiPropertyOptional({ description: 'Work order number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  wo_number?: string;

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
  part_number?: string;

  @ApiPropertyOptional({ description: 'Quantity open' })
  @IsOptional()
  @IsInt()
  @Min(0)
  qty_open?: number;

  @ApiPropertyOptional({ description: 'Sequence number' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sequence?: number;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsString()
  due_date?: string;

  @ApiPropertyOptional({ description: 'Release date' })
  @IsOptional()
  @IsString()
  release_date?: string;
}

/**
 * DTO for updating schedule data
 */
export class UpdateScheduleDataDto extends PartialType(CreateScheduleDataDto) {}
