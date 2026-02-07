import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsObject,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ColumnMappingConfigItem {
  @ApiProperty()
  sourceColumn: string;

  @ApiPropertyOptional()
  required?: boolean;
}

export class CreateColumnMappingDto {
  @ApiProperty({ description: 'Name of the mapping' })
  @IsString()
  mappingName: string;

  @ApiPropertyOptional({ description: 'Description of the mapping' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Source type (e.g., excel)', default: 'excel' })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiPropertyOptional({ description: 'Is default mapping', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'List of required target column IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredColumns?: string[];

  @ApiProperty({
    description:
      'Mapping configuration: targetKey -> { sourceColumn, required }',
    example: { woId: { sourceColumn: 'work_order', required: true } },
  })
  @IsObject()
  mappingConfig: Record<string, any>;
}

export class UpdateColumnMappingDto extends CreateColumnMappingDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  id?: string;
}

export class ColumnMappingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  mappingName: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  sourceType: string;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty({ type: [String] })
  requiredColumns: string[];

  @ApiProperty()
  mappingConfig: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
