import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPreferenceDto {
  @ApiProperty({ example: 'schedule' })
  key: string;

  @ApiProperty({ example: { visibleColumns: ['status', 'progress'] } })
  value: any;
}

export class UserPreferencesResponseDto {
  @ApiProperty()
  preferences: Record<string, any>;
}
