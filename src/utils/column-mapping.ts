import { findColumnValue } from './schedule-normalizer';

/**
 * Default column mapping configuration
 * Maps schedule_data entity fields to normalized column sources
 */
export function getDefaultColumnMapping(): Record<
  string,
  { source: string; alternates?: string[] }
> {
  return {
    woId: {
      source: 'woId',
      alternates: ['work_order_id', 'workorderid', 'wo', 'id'],
    },
    woNumber: {
      source: 'woNumber',
      alternates: ['work_order_number', 'wo_num'],
    },
    partNumber: {
      source: 'partNumber',
      alternates: ['partnumber', 'part_no', 'pn', 'item'],
    },
    department: {
      source: 'department',
      alternates: ['dept', 'department_name', 'area'],
    },
    status: {
      source: 'status',
      alternates: ['wo_status', 'state', 'order_status'],
    },
    qtyOpen: {
      source: 'qtyOpen',
      alternates: ['quantity_open', 'open_qty', 'qty'],
    },
    dueDate: {
      source: 'dueDate',
      alternates: ['duedate', 'due', 'required_date'],
    },
    releaseDate: {
      source: 'releaseDate',
      alternates: ['releasedate', 'release', 'start_date'],
    },
    prodDate: {
      source: 'prodDate',
      alternates: ['production_date', 'proddate'],
    },
    sequence: {
      source: 'sequence',
      alternates: ['seq', 'priority', 'order', 'line'],
    },
    shift: { source: 'shift', alternates: ['work_shift', 'shift_id'] },
    bulkLot: { source: 'bulkLot', alternates: ['lot', 'lot_number', 'batch'] },
    prodQty: {
      source: 'prodQty',
      alternates: ['production_qty', 'quantity_produced'],
    },
    inspQty: {
      source: 'inspQty',
      alternates: ['inspection_qty', 'inspected'],
    },
    rejected: { source: 'rejected', alternates: ['reject_qty', 'rejects'] },
  };
}

/**
 * Apply column mapping to transform normalized row to schedule_data fields
 */
export function applyColumnMapping(
  normalizedRow: Record<string, any>,
  mappingConfig?: Record<string, { source: string; alternates?: string[] }>,
): Record<string, any> {
  const config = mappingConfig || getDefaultColumnMapping();
  const mapped: Record<string, any> = {};

  for (const [targetField, { source, alternates }] of Object.entries(config)) {
    // Try primary source first
    let value = normalizedRow[source];

    // Try alternates if primary not found
    if (value === undefined && alternates) {
      for (const alt of alternates) {
        if (normalizedRow[alt] !== undefined) {
          value = normalizedRow[alt];
          break;
        }
      }
    }

    if (value !== undefined) {
      mapped[targetField] = value;
    }
  }

  return mapped;
}

/**
 * Parse a value to integer, returning 0 if invalid
 */
export function parseIntSafe(value: any): number {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Transform mapped row to schedule_data entity format with proper types
 */
export function transformToScheduleData(
  mapped: Record<string, any>,
  companyId: string,
  scheduleFileId?: string,
  importBatchId?: string,
): Record<string, any> {
  return {
    companyId,
    scheduleFileId: scheduleFileId || null,
    woId: String(mapped.woId || mapped.wo_id || '').trim(),
    woNumber: mapped.woNumber || mapped.wo_number || null,
    partNumber: mapped.partNumber || mapped.part_number || null,
    department: mapped.department || null,
    status: mapped.status || null,
    qtyOpen: parseIntSafe(mapped.qtyOpen || mapped.qty_open),
    dueDate: mapped.dueDate || mapped.due_date || null,
    releaseDate: mapped.releaseDate || mapped.release_date || null,
    prodDate: mapped.prodDate || mapped.prod_date || null,
    sequence: parseIntSafe(mapped.sequence),
    shift: mapped.shift || null,
    bulkLot: mapped.bulkLot || mapped.bulk_lot || null,
    prodQty: mapped.prodQty || mapped.prod_qty || null,
    inspQty: parseIntSafe(mapped.inspQty || mapped.insp_qty),
    rejected: parseIntSafe(mapped.rejected),
    importBatchId: importBatchId || null,
    isSynced: false,
  };
}
