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
  departmentName: string;

  @ApiPropertyOptional({ example: 'PROD' })
  @IsString()
  @IsOptional()
  departmentCode?: string;

  @ApiPropertyOptional({ example: 'Production Department' })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;

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
  departmentName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  departmentCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;
}
