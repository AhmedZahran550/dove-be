import { Expose, Type } from 'class-transformer';

export class PartNumberRelationDto {
  @Expose()
  id: string;
}

export class PartNumberResponseDto {
  @Expose()
  id: string;

  @Expose()
  productId: string;

  @Expose()
  description: string;

  @Expose()
  inventoryType: string;

  @Expose()
  productCategory: string;

  @Expose()
  productSubcategory: string;

  @Expose()
  uom: string;

  @Expose()
  lifecycleStatus: string;

  @Expose()
  standardCost: number;

  @Expose()
  sellingPrice: number;

  @Expose()
  sku: string;

  @Expose()
  barcode: string;

  @Expose()
  makeOrBuy: string;

  @Expose()
  leadTimeDays: number;

  @Expose()
  reorderPoint: number;

  @Expose()
  safetyStock: number;

  @Expose()
  idealCycleTime: number | string;

  @Expose()
  cycleTime: number;

  @Expose()
  isActive: boolean;

  @Expose()
  @Type(() => PartNumberRelationDto)
  company: PartNumberRelationDto;

  @Expose()
  @Type(() => PartNumberRelationDto)
  location: PartNumberRelationDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
