import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PartNumberRelationDto {
  @Expose()
  @ApiProperty()
  id: string;
}

export class PartNumberResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  productId: string;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiProperty()
  inventoryType: string;

  @Expose()
  @ApiProperty()
  productCategory: string;

  @Expose()
  @ApiProperty()
  productSubcategory: string;

  @Expose()
  @ApiProperty()
  uom: string;

  @Expose()
  @ApiProperty()
  lifecycleStatus: string;

  @Expose()
  @ApiProperty()
  standardCost: number;

  @Expose()
  @ApiProperty()
  sellingPrice: number;

  @Expose()
  @ApiProperty()
  sku: string;

  @Expose()
  @ApiProperty()
  barcode: string;

  @Expose()
  @ApiProperty()
  makeOrBuy: string;

  @Expose()
  @ApiProperty()
  leadTimeDays: number;

  @Expose()
  @ApiProperty()
  reorderPoint: number;

  @Expose()
  @ApiProperty()
  safetyStock: number;

  @Expose()
  @ApiProperty()
  idealCycleTime: number | string;

  @Expose()
  @ApiProperty()
  cycleTime: number;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty({ type: PartNumberRelationDto })
  @Type(() => PartNumberRelationDto)
  company: PartNumberRelationDto;

  @Expose()
  @ApiProperty({ type: PartNumberRelationDto })
  @Type(() => PartNumberRelationDto)
  location: PartNumberRelationDto;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
