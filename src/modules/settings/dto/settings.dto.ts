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
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Requires rework', default: false })
  @IsOptional()
  @IsBoolean()
  requiresRework?: boolean;

  @ApiPropertyOptional({ description: 'Requires scrap', default: false })
  @IsOptional()
  @IsBoolean()
  requiresScrap?: boolean;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
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
  isActive?: boolean;
}

/**
 * DTO for creating a rejection reason
 */
export class CreateRejectionReasonDto {
  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  categoryId: string;

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
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Requires photo', default: false })
  @IsOptional()
  @IsBoolean()
  requiresPhoto?: boolean;

  @ApiPropertyOptional({ description: 'Requires comment', default: false })
  @IsOptional()
  @IsBoolean()
  requiresComment?: boolean;

  @ApiPropertyOptional({ description: 'Requires approval', default: false })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ description: 'Default action' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  defaultAction?: string;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
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
  isActive?: boolean;
}
