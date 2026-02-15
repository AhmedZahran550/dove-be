import { getDefaultColumnMapping, applyColumnMapping, transformToScheduleData } from './column-mapping';

describe('column-mapping', () => {
  describe('applyColumnMapping', () => {
    it('should map camelCase normalized fields correctly', () => {
      const normalizedRow = {
        woId: 'WO-123',
        dueDate: '2026-02-15',
        partNumber: 'PART-A',
      };
      
      const mapped = applyColumnMapping(normalizedRow);
      
      expect(mapped.woId).toBe('WO-123');
      expect(mapped.dueDate).toBe('2026-02-15');
      expect(mapped.partNumber).toBe('PART-A');
    });

    it('should fallback to alternates if primary source is missing', () => {
      const normalizedRow = {
        work_order_id: 'WO-123', // old snake_case
        due_date: '2026-02-15',
      };
      
      const mapped = applyColumnMapping(normalizedRow);
      
      expect(mapped.woId).toBe('WO-123');
      expect(mapped.dueDate).toBe('2026-02-15');
    });
  });

  describe('transformToScheduleData', () => {
    it('should transform mapped data to entity format', () => {
      const mapped = {
        woId: 'WO-123',
        dueDate: '2026-02-15',
        qtyOpen: '10',
      };
      
      const entity = transformToScheduleData(mapped, 'company-1');
      
      expect(entity.woId).toBe('WO-123');
      expect(entity.dueDate).toBe('2026-02-15');
      expect(entity.qtyOpen).toBe(10);
      expect(entity.companyId).toBe('company-1');
    });
  });
});
