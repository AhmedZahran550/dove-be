/**
 * Normalize a column name to camelCase format
 * Examples:
 *   "Work Order ID" -> "woId" (special case)
 *   "Due Date" -> "dueDate"
 *   "PartNumber" -> "partNumber"
 */
export function normalizeColumnName(name: string): string {
  if (!name) return '';

  // Special cases for exact matches (case-insensitive)
  const cleanName = name.trim().toLowerCase();
  if (
    cleanName === 'work order id' ||
    cleanName === 'work_order_id' ||
    cleanName === 'wo id' ||
    cleanName === 'wo_id'
  ) {
    return 'woId';
  }

  // General camelCase normalization
  const words = name
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[\s_]+/)
    .filter(Boolean);

  if (words.length === 0) return '';

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

/**
 * Generate normalization rules from Excel column names
 * Maps original Excel column names to normalized camelCase names
 */
export function generateNormalizationRules(
  sourceColumns: string[],
): Record<string, string> {
  const rules: Record<string, string> = {};

  for (const column of sourceColumns) {
    if (column && column.trim()) {
      rules[column] = normalizeColumnName(column);
    }
  }

  return rules;
}

/**
 * Apply normalization rules to a row of data
 * Converts Excel column names to normalized names
 */
export function applyNormalization(
  row: Record<string, any>,
  rules: Record<string, string>,
): Record<string, any> {
  const normalized: Record<string, any> = {};

  for (const [originalKey, value] of Object.entries(row)) {
    // Use the rule if it exists, otherwise normalize on the fly
    const normalizedKey =
      rules[originalKey] || normalizeColumnName(originalKey);
    normalized[normalizedKey] = value;
  }

  return normalized;
}

/**
 * Common column name variations for schedule data fields
 * Maps various possible Excel column names to standard camelCase field names
 */
export const COLUMN_ALIASES: Record<string, string[]> = {
  woId: [
    'woId',
    'wo_id',
    'work_order_id',
    'workorderid',
    'wo',
    'id',
    'order_id',
    'work_order',
  ],
  woNumber: ['woNumber', 'wo_number', 'work_order_number', 'wo_num', 'number'],
  partNumber: [
    'partNumber',
    'part_number',
    'partnumber',
    'part_no',
    'pn',
    'item',
    'item_number',
  ],
  department: ['department', 'dept', 'department_name', 'area'],
  status: ['status', 'wo_status', 'state', 'order_status'],
  qtyOpen: [
    'qtyOpen',
    'qty_open',
    'quantity_open',
    'open_qty',
    'qty',
    'quantity',
  ],
  dueDate: ['dueDate', 'due_date', 'duedate', 'due', 'required_date'],
  releaseDate: [
    'releaseDate',
    'release_date',
    'releasedate',
    'release',
    'start_date',
  ],
  prodDate: ['prodDate', 'prod_date', 'production_date', 'proddate', 'mfg_date'],
  sequence: ['sequence', 'seq', 'priority', 'order', 'line'],
  shift: ['shift', 'work_shift', 'shift_id'],
  bulkLot: ['bulkLot', 'bulk_lot', 'lot', 'lot_number', 'batch'],
  prodQty: ['prodQty', 'prod_qty', 'production_qty', 'quantity_produced'],
  inspQty: ['inspQty', 'insp_qty', 'inspection_qty', 'inspected'],
  rejected: ['rejected', 'reject_qty', 'rejects'],
};

/**
 * Find the best matching column from a row based on aliases
 * Supports original Excel headers by normalizing them on the fly
 */
export function findColumnValue(
  row: Record<string, any>,
  targetField: string,
): any {
  const aliases = COLUMN_ALIASES[targetField] || [targetField];

  // First try exact alias matches in the row
  for (const alias of aliases) {
    if (row[alias] !== undefined) {
      return row[alias];
    }
  }

  // Fallback: search by normalizing each key in the row
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = normalizeColumnName(key);
    if (normalizedKey === targetField || aliases.includes(normalizedKey)) {
      return value;
    }
  }

  return undefined;
}
