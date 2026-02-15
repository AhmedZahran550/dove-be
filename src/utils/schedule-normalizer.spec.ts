import { normalizeColumnName } from './schedule-normalizer';

describe('schedule-normalizer', () => {
  describe('normalizeColumnName', () => {
    it('should convert "Work Order ID" to "woId"', () => {
      expect(normalizeColumnName('Work Order ID')).toBe('woId');
    });

    it('should convert "Due Date" to "dueDate"', () => {
      expect(normalizeColumnName('Due Date')).toBe('dueDate');
    });

    it('should convert "Release Date" to "releaseDate"', () => {
      expect(normalizeColumnName('Release Date')).toBe('releaseDate');
    });

    it('should convert "PartNumber" to "partNumber"', () => {
      expect(normalizeColumnName('PartNumber')).toBe('partNumber');
    });

    it('should convert "Qty Open" to "qtyOpen"', () => {
      expect(normalizeColumnName('Qty Open')).toBe('qtyOpen');
    });

    it('should handle special characters', () => {
      expect(normalizeColumnName('Prod. Date')).toBe('prodDate');
    });

    it('should handle multiple spaces and underscores', () => {
      expect(normalizeColumnName('  Bulk__Lot  ')).toBe('bulkLot');
    });
  });
});
