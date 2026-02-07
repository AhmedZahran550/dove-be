import { WorkOrderStatus } from '../../../database/entities/work-order-status.entity';

/**
 * Default work order statuses available to all companies
 * These act as fallbacks when a company hasn't created custom statuses
 * Companies can override these by creating statuses with the same code
 */
export const DEFAULT_WORK_ORDER_STATUSES: Partial<WorkOrderStatus>[] = [
  {
    name: 'waiting',
    code: 'WAITING',
    description: 'Work order is scheduled but not yet started',
    color: '#6B7280',
    fontColor: '#FFFFFF',
    borderColor: null,
    fontWeight: 'normal',
    icon: null,
    isDefault: false,
    isTerminal: false,
    canEditWo: true,
    requiresApproval: false,
    displayOrder: 0,
    isActive: true,
    isFlashing: false,
  },
  {
    name: 'running',
    code: 'RUNNING',
    description: 'Work order is currently in progress',
    color: '#3B82F6',
    fontColor: '#FFFFFF',
    borderColor: null,
    fontWeight: 'normal',
    icon: null,
    isDefault: false,
    isTerminal: false,
    canEditWo: true,
    requiresApproval: false,
    displayOrder: 1,
    isActive: true,
    isFlashing: false,
  },
  {
    name: 'ongoing',
    code: 'ONGOING',
    description: 'Work order is ongoing (paused or between shifts)',
    color: '#F59E0B',
    fontColor: '#FFFFFF',
    borderColor: null,
    fontWeight: 'normal',
    icon: null,
    isDefault: false,
    isTerminal: false,
    canEditWo: true,
    requiresApproval: false,
    displayOrder: 2,
    isActive: true,
    isFlashing: false,
  },
  {
    name: 'completed',
    code: 'COMPLETED',
    description: 'Work order has been finished',
    color: '#10B981',
    fontColor: '#FFFFFF',
    borderColor: null,
    fontWeight: 'normal',
    icon: null,
    isDefault: false,
    isTerminal: false,
    canEditWo: true,
    requiresApproval: false,
    displayOrder: 3,
    isActive: true,
    isFlashing: false,
  },
];

/**
 * Get a pseudo-ID for a default status (for frontend compatibility)
 * Uses a deterministic UUID-like format based on the status code
 */
export function getDefaultStatusId(code: string): string {
  const statusIds: Record<string, string> = {
    WAITING: '00000000-0000-4000-8000-000000000001',
    RUNNING: '00000000-0000-4000-8000-000000000002',
    ONGOING: '00000000-0000-4000-8000-000000000003',
    COMPLETED: '00000000-0000-4000-8000-000000000004',
  };
  return statusIds[code] || '00000000-0000-4000-8000-000000000000';
}

/**
 * Status type enum to differentiate between default and custom statuses
 */
export enum StatusType {
  DEFAULT = 'default',
  CUSTOM = 'custom',
}
