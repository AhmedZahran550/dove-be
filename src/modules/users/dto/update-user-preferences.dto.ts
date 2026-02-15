import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class UpdateUserPreferencesDto {
  @ApiProperty({ example: 'schedule' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: { visibleColumns: ['id', 'status'] } })
  @IsObject()
  @IsNotEmpty()
  value: any;
}
