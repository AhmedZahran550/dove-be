import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserPreferenceDto {
  @ApiProperty({ example: 'schedule' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: { visibleColumns: ['status', 'progress'] } })
  @IsNotEmpty()
  value: any;
}

export class UserPreferencesResponseDto {
  @ApiProperty()
  preferences: Record<string, any>;
}
