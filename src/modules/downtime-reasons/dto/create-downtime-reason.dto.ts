import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDowntimeReasonDto {
  @ApiProperty({ description: 'The reason text', example: 'Machine Breakdown' })
  @IsString()
  reasonText: string;

  @ApiProperty({ description: 'Category ID', example: 'uuid-string' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'Description of the downtime reason',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Is active status',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Department ID', required: false })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({ description: 'Display order', default: 0, required: false })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}
