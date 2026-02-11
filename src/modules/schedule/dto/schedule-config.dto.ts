import { ApiProperty } from '@nestjs/swagger';

export class ScheduleColumnDto {
  @ApiProperty()
  excelName: string;

  @ApiProperty()
  normalizedName: string;
}

export class ScheduleColumnsResponseDto {
  @ApiProperty({ type: [ScheduleColumnDto] })
  data: ScheduleColumnDto[];
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
