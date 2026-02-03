import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  ValidateNested,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ConnectRelationDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class CreatePartNumberDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  productId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  inventoryType?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  productCategory?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  uom?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lifecycleStatus?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  standardCost?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  sellingPrice?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  makeOrBuy?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  leadTimeDays?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  reorderPoint?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  safetyStock?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  idealCycleTime?: string; // Entity uses string

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  cycleTime?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ type: ConnectRelationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectRelationDto)
  location?: ConnectRelationDto;
}
