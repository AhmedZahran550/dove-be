import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  IsUUID,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

/**
 * DTO for creating a rejection category
 */
export class CreateRejectionCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Category code' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Color hex code (e.g., #FF5733)' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiPropertyOptional({ description: 'Requires rework', default: false })
  @IsOptional()
  @IsBoolean()
  requires_rework?: boolean;

  @ApiPropertyOptional({ description: 'Requires scrap', default: false })
  @IsOptional()
  @IsBoolean()
  requires_scrap?: boolean;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  display_order?: number;
}

/**
 * DTO for updating a rejection category
 */
export class UpdateRejectionCategoryDto extends PartialType(
  CreateRejectionCategoryDto,
) {
  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

/**
 * DTO for creating a rejection reason
 */
export class CreateRejectionReasonDto {
  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  category_id: string;

  @ApiProperty({ description: 'Reason name' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Reason code' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiPropertyOptional({ description: 'Requires photo', default: false })
  @IsOptional()
  @IsBoolean()
  requires_photo?: boolean;

  @ApiPropertyOptional({ description: 'Requires comment', default: false })
  @IsOptional()
  @IsBoolean()
  requires_comment?: boolean;

  @ApiPropertyOptional({ description: 'Requires approval', default: false })
  @IsOptional()
  @IsBoolean()
  requires_approval?: boolean;

  @ApiPropertyOptional({ description: 'Default action' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  default_action?: string;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  display_order?: number;
}

/**
 * DTO for updating a rejection reason
 */
export class UpdateRejectionReasonDto extends PartialType(
  CreateRejectionReasonDto,
) {
  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
