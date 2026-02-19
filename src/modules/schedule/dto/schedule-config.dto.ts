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
  @ApiProperty()
  id: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  sourceType: string;

  @ApiProperty()
  syncFrequency: string;

  @ApiProperty()
  autoSyncEnabled: boolean;

  @ApiProperty()
  emailNotifications: boolean;

  @ApiProperty()
  automaticBackups: boolean;

  @ApiProperty({ nullable: true })
  lastSyncStatus?: string | null;

  @ApiProperty({ nullable: true })
  lastSyncError?: string | null;

  @ApiProperty({ nullable: true })
  lastSyncedAt?: Date | null;
}

export class ScheduleConfigResponseDto {
  @ApiProperty()
  scheduleFile: ScheduleSyncStatusDto;
}
