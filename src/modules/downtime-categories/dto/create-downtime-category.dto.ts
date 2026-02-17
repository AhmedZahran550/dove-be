import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDowntimeCategoryDto {
  @ApiProperty({ description: 'Name of the downtime category' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the downtime category',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Department ID', required: false })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  companyId: string;
}
