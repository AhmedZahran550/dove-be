import { ApiProperty } from '@nestjs/swagger';

export class ScheduleColumnDto {
  @ApiProperty()
  excelName: string;

  @ApiProperty()
  normalizedName: string;
}

export class ScheduleColumnsResponseDto {
  @ApiProperty({ type: [ScheduleColumnDto] })
  scheduleDataColumns: ScheduleColumnDto[];

  @ApiProperty({ type: [String] })
  workOrderColumns: string[];

  @ApiProperty({ type: [String] })
  allColumns: string[];
}

export class ScheduleSyncStatusDto {
  @ApiProperty({ nullable: true })
  lastSyncStatus: string | null;

  @ApiProperty({ nullable: true })
  lastSyncError: string | null;

  @ApiProperty()
  syncRetryCount: number;

  @ApiProperty()
  sourceType: string;

  @ApiProperty({ nullable: true })
  lastSyncedAt: Date | null;
}

export class ScheduleConfigResponseDto {
  @ApiProperty()
  scheduleFile: ScheduleSyncStatusDto;
}
