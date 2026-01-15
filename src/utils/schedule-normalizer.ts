/**
 * Normalize a column name to snake_case lowercase format
 * Examples:
 *   "Work Order ID" -> "work_order_id"
 *   "PartNumber" -> "part_number"
 *   "Qty Open" -> "qty_open"
 */
export function normalizeColumnName(name: string): string {
  if (!name) return '';

  return (
    name
      .trim()
      // Replace special characters with spaces
      .replace(/[^\w\s]/g, ' ')
      // Convert camelCase to snake_case
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      // Replace spaces and multiple underscores with single underscore
      .replace(/[\s_]+/g, '_')
      // Convert to lowercase
      .toLowerCase()
      // Remove leading/trailing underscores
      .replace(/^_+|_+$/g, '')
  );
}

/**
 * Generate normalization rules from Excel column names
 * Maps original Excel column names to normalized snake_case names
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
 * Maps various possible Excel column names to standard field names
 */
export const COLUMN_ALIASES: Record<string, string[]> = {
  wo_id: ['wo_id', 'work_order_id', 'workorderid', 'wo', 'id', 'order_id'],
  wo_number: ['wo_number', 'work_order_number', 'wo_num', 'number'],
  part_number: [
    'part_number',
    'partnumber',
    'part_no',
    'pn',
    'item',
    'item_number',
  ],
  department: ['department', 'dept', 'department_name', 'area'],
  status: ['status', 'wo_status', 'state', 'order_status'],
  qty_open: ['qty_open', 'quantity_open', 'open_qty', 'qty', 'quantity'],
  due_date: ['due_date', 'duedate', 'due', 'required_date'],
  release_date: ['release_date', 'releasedate', 'release', 'start_date'],
  prod_date: ['prod_date', 'production_date', 'proddate', 'mfg_date'],
  sequence: ['sequence', 'seq', 'priority', 'order', 'line'],
  shift: ['shift', 'work_shift', 'shift_id'],
  bulk_lot: ['bulk_lot', 'lot', 'lot_number', 'batch'],
  prod_qty: ['prod_qty', 'production_qty', 'quantity_produced'],
  insp_qty: ['insp_qty', 'inspection_qty', 'inspected'],
  rejected: ['rejected', 'reject_qty', 'rejects'],
};

/**
 * Find the best matching column from a row based on aliases
 */
export function findColumnValue(
  row: Record<string, any>,
  targetField: string,
): any {
  const aliases = COLUMN_ALIASES[targetField] || [targetField];

  for (const alias of aliases) {
    if (row[alias] !== undefined) {
      return row[alias];
    }
  }

  return undefined;
}
