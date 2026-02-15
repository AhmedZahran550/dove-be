import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

/**
 * DTO for saving schedule file configuration
 */
export class SaveScheduleConfigDto {
  @ApiProperty({ description: 'Name of the schedule file' })
  @IsString()
  fileName: string;

  @ApiPropertyOptional({ description: 'Source type', default: 'file_upload' })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiPropertyOptional({ description: 'Sync frequency', default: 'manual' })
  @IsOptional()
  @IsString()
  syncFrequency?: string;

  @ApiPropertyOptional({ description: 'Enable auto sync', default: false })
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
 * DTO for schedule import request (body parameters)
 */
export class ImportScheduleDto {
  @ApiPropertyOptional({
    description: 'Existing schedule file ID to associate with',
  })
  @IsOptional()
  @IsUUID()
  scheduleFileId?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  file?: any;
}

/**
 * Response DTO for import statistics
 */
export class ImportResultDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  importBatchId: string;

  @ApiProperty()
  stats: {
    totalRecordsInFile: number;
    validRecords: number;
    importedRecords: number;
    updatedRecords: number;
    skippedRecords: number;
    totalRecordsInDatabase: number;
  };

  @ApiPropertyOptional()
  scheduleFileId?: string;
}
