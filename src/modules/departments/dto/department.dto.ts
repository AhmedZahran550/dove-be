import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FilterRuleDto {
  @ApiProperty()
  @IsString()
  table: string;

  @ApiProperty()
  @IsString()
  column: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  operator?: string;
}

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Production' })
  @IsString()
  @IsNotEmpty()
  department_name: string;

  @ApiPropertyOptional({ example: 'PROD' })
  @IsString()
  @IsOptional()
  department_code?: string;

  @ApiPropertyOptional({ example: 'Production Department' })
  @IsString()
  @IsOptional()
  display_name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sort_order?: number;

  @ApiPropertyOptional({ type: [FilterRuleDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FilterRuleDto)
  includeFilters?: FilterRuleDto[];

  @ApiPropertyOptional({ type: [FilterRuleDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FilterRuleDto)
  excludeFilters?: FilterRuleDto[];
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  department_name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  department_code?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  display_name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sort_order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  is_active?: boolean;
}

