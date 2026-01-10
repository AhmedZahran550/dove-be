import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Location } from './location.entity';
import { ProductVendor } from './product-vendor.entity';
import { ProductCostHistory } from './product-cost-history.entity';
import { ProductPricing } from './product-pricing.entity';

@Entity('partnumber_info')
@Unique(['companyId', 'productId'])
@Index(['companyId'])
@Index(['locationId'])
@Index(['productId'])
@Index(['department'])
@Index(['isActive'])
@Index(['inventoryType'])
@Index(['lifecycleStatus'])
@Index(['abcClassification'])
@Index(['primaryVendorId'])
@Index(['sku'])
@Index(['barcode'])
@Index(['productCategory'])
@Index(['makeOrBuy'])
@Index(['companyId', 'lifecycleStatus'])
@Index(['companyId', 'productCategory'])
@Index(['companyId', 'inventoryType'])
export class PartnumberInfo extends BaseEntity {
  // Multi-tenant (Organization & Location)
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid', nullable: true })
  locationId?: string;

  // Product Identification
  @Column({ type: 'varchar', length: 100 })
  productId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  productLine?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department?: string;

  // Product Details
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  uom?: string;

  // Production Information (Legacy)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prodLine?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  productionLine?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  routingCode?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  purchMfg?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  schedulerId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  runSequence1?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  runSequence2?: string;

  // Timing & Capacity (Legacy)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cycleTime?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  idealCycleTime?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  productSetupTime?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  scheduledUnitHour?: string;

  @Column({ type: 'integer', nullable: true })
  cavityNumber?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cavity?: string;

  // Product Classification (Legacy)
  @Column({ type: 'varchar', length: 100, nullable: true })
  productFamily?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  productType?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  productSize?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  productColor?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  productFeature?: string;

  // Quality & Inspection (Legacy)
  @Column({ type: 'text', nullable: true })
  inspectionStages?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  shelfLife?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  stamp?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  capsType?: string;

  // Media
  @Column({ type: 'text', nullable: true })
  productImage?: string;

  // ===== NEW INDUSTRY STANDARD FIELDS =====

  // Inventory & Costing
  @Column({ type: 'varchar', length: 50, nullable: true })
  inventoryType?: string;

  @Column({ type: 'varchar', length: 20, default: 'average' })
  valuationMethod: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  standardCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  lastCost?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  averageCost?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  sellingPrice?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  minimumPrice?: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currencyCode: string;

  // Planning & Procurement (MRP)
  @Column({ type: 'integer', default: 0 })
  leadTimeDays: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  reorderPoint: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  reorderQuantity?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  safetyStock: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 1 })
  minimumOrderQty: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maximumOrderQty?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 1 })
  lotSizeMultiple: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  economicOrderQty?: number;

  @Column({ type: 'varchar', length: 10, default: 'make' })
  makeOrBuy: string;

  // Inventory Control (WMS)
  @Column({ type: 'boolean', default: false })
  trackSerialNumbers: boolean;

  @Column({ type: 'boolean', default: false })
  trackLotNumbers: boolean;

  @Column({ type: 'boolean', default: false })
  trackExpiration: boolean;

  @Column({ type: 'integer', nullable: true })
  expirationDays?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  defaultBinLocation?: string;

  @Column({ type: 'char', length: 1, default: 'C' })
  abcClassification: string;

  @Column({ type: 'boolean', default: false })
  criticalItem: boolean;

  @Column({ type: 'boolean', default: false })
  hazmat: boolean;

  // Physical Attributes (Logistics)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  length?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  width?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  height?: number;

  @Column({ type: 'varchar', length: 10, default: 'in' })
  dimensionUom: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'varchar', length: 10, default: 'lb' })
  weightUom: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  volume?: number;

  @Column({ type: 'varchar', length: 10, default: 'cu_ft' })
  volumeUom: string;

  // Quality & Compliance
  @Column({ type: 'boolean', default: false })
  requiresInspection: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  inspectionType?: string;

  @Column({ type: 'integer', nullable: true })
  sampleSize?: number;

  @Column({ type: 'text', nullable: true })
  specificationDocument?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  drawingNumber?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  revisionNumber?: string;

  @Column({ type: 'text', nullable: true })
  sdsSheetUrl?: string;

  // Manufacturing Details (MES)
  @Column({ type: 'uuid', nullable: true })
  primaryWorkCenterId?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  scrapPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  yieldPercentage: number;

  @Column({ type: 'integer', default: 0 })
  changeoverTime: number;

  @Column({ type: 'integer', nullable: true })
  batchSizeMin?: number;

  @Column({ type: 'integer', nullable: true })
  batchSizeMax?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  runRatePerHour?: number;

  // BOM & Assembly (PLM)
  @Column({ type: 'integer', default: 0 })
  bomLevel: number;

  @Column({ type: 'boolean', default: false })
  hasBom: boolean;

  @Column({ type: 'integer', default: 0 })
  bomComponentCount: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  assemblyType?: string;

  @Column({ type: 'boolean', default: false })
  phantomAssembly: boolean;

  // Sales & Marketing
  @Column({ type: 'varchar', length: 100, nullable: true })
  productCategory?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  productSubcategory?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  modelNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode?: string;

  @Column({ type: 'text', nullable: true })
  qrCode?: string;

  // Lifecycle Management
  @Column({ type: 'varchar', length: 50, default: 'active' })
  lifecycleStatus: string;

  @Column({ type: 'date', nullable: true })
  introductionDate?: Date;

  @Column({ type: 'date', nullable: true })
  phaseOutDate?: Date;

  @Column({ type: 'date', nullable: true })
  obsoleteDate?: Date;

  @Column({ type: 'uuid', nullable: true })
  replacementPartId?: string;

  // Compliance & Regulatory
  @Column({ type: 'varchar', length: 50, nullable: true })
  taxClass?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  tariffCode?: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  countryOfOrigin?: string;

  // Modern Enhancements (Industry 4.0)
  @Column({ type: 'jsonb', default: '{}' })
  metadata: any;

  @Column({ type: 'jsonb', default: '{}' })
  customFields: any;

  @Column({ type: 'jsonb', default: '{}' })
  regulatoryCompliance: any;

  @Column({ type: 'jsonb', default: '[]' })
  alternateWorkCenters: any;

  @Column({ type: 'jsonb', default: '[]' })
  operationSequence: any;

  @Column({ type: 'jsonb', default: '[]' })
  tags: any;

  // Vendor/Supplier Management
  @Column({ type: 'uuid', nullable: true })
  primaryVendorId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vendorPartNumber?: string;

  // Accounting Integration
  @Column({ type: 'varchar', length: 50, nullable: true })
  costCenter?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  glAccount?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  glExpenseAccount?: string;

  // Additional Status Fields
  @Column({ type: 'boolean', default: true })
  purchasable: boolean;

  @Column({ type: 'boolean', default: true })
  sellable: boolean;

  @Column({ type: 'boolean', default: false })
  discontinued: boolean;

  @Column({ type: 'boolean', default: false })
  internalUseOnly: boolean;

  // Status & Audit
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => Location, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'locationId' })
  location?: Location;

  @OneToMany(() => ProductVendor, (vendor) => vendor.product)
  productVendors?: ProductVendor[];

  @OneToMany(() => ProductCostHistory, (history) => history.product)
  costHistory?: ProductCostHistory[];

  @OneToMany(() => ProductPricing, (pricing) => pricing.product)
  pricing?: ProductPricing[];
}
