import { getMetadataArgsStorage } from 'typeorm';
import { Location } from '../src/database/entities/location.entity';

describe('Location Entity (Dynamic Shifts) Metadata', () => {
  it('Location entity should have "shifts" column', () => {
    const storage = getMetadataArgsStorage();
    const columns = storage.columns.filter(c => c.target === Location);
    
    const shiftsCol = columns.find(c => c.propertyName === 'shifts');
    expect(shiftsCol).toBeDefined();
    expect(shiftsCol.options.type).toBe('jsonb');
  });

  it('Location entity should NOT have "email" column', () => {
    const storage = getMetadataArgsStorage();
    const columns = storage.columns.filter(c => c.target === Location);
    
    const emailCol = columns.find(c => c.propertyName === 'email');
    expect(emailCol).toBeUndefined();
  });

  it('Location entity should map fields correctly', () => {
    const storage = getMetadataArgsStorage();
    const columns = storage.columns.filter(c => c.target === Location);
    
    const managerEmailCol = columns.find(c => c.propertyName === 'managerEmail');
    expect(managerEmailCol).toBeDefined();
    
    const addressCol = columns.find(c => c.propertyName === 'addressLine1');
    expect(addressCol).toBeDefined();
    
    const stateCol = columns.find(c => c.propertyName === 'stateProvince');
    expect(stateCol).toBeDefined();
  });
});
