import { DefaultNamingStrategy, NamingStrategyInterface, Table } from 'typeorm';

/**
 * Custom TypeORM naming strategy that:
 * - Converts column names to snake_case
 * - Prefixes foreign keys with FK_
 * - Prefixes primary keys with PK_
 * - Prefixes indexes with IDX_
 * - Prefixes unique constraints with UQ_
 */
export class CustomNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  /**
   * Convert string to snake_case
   */
  private toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  /**
   * Column name: convert camelCase to snake_case
   */
  columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[],
  ): string {
    const name = customName || this.toSnakeCase(propertyName);
    return embeddedPrefixes.length
      ? embeddedPrefixes.map((p) => this.toSnakeCase(p)).join('_') + '_' + name
      : name;
  }

  /**
   * Table name: convert to snake_case and pluralize
   */
  tableName(className: string, customName: string | undefined): string {
    return customName || this.toSnakeCase(className) + 's';
  }

  /**
   * Primary key constraint name: PK_{tableName}
   */
  primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
    const tableName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    return `PK_${tableName}`;
  }

  /**
   * Foreign key name: FK_{tableName}_{referencedTableName}_{columnName}
   */
  foreignKeyName(
    tableOrName: Table | string,
    columnNames: string[],
    referencedTableName?: string,
    referencedColumnNames?: string[],
  ): string {
    const tableName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    const columnsSnake = columnNames.join('_');
    return `FK_${tableName}_${referencedTableName || 'ref'}_${columnsSnake}`;
  }

  /**
   * Index name: IDX_{tableName}_{columnNames}
   */
  indexName(
    tableOrName: Table | string,
    columnNames: string[],
    where?: string,
  ): string {
    const tableName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    const columnsSnake = columnNames.join('_');
    return `IDX_${tableName}_${columnsSnake}`;
  }

  /**
   * Unique constraint name: UQ_{tableName}_{columnNames}
   */
  uniqueConstraintName(
    tableOrName: Table | string,
    columnNames: string[],
  ): string {
    const tableName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    const columnsSnake = columnNames.join('_');
    return `UQ_${tableName}_${columnsSnake}`;
  }

  /**
   * Relation constraint name
   */
  relationConstraintName(
    tableOrName: Table | string,
    columnNames: string[],
    where?: string,
  ): string {
    const tableName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    const columnsSnake = columnNames.join('_');
    return `REL_${tableName}_${columnsSnake}`;
  }

  /**
   * Join column name: {propertyName}_id
   */
  joinColumnName(relationName: string, referencedColumnName: string): string {
    return this.toSnakeCase(relationName) + '_' + referencedColumnName;
  }

  /**
   * Join table name: {firstTableName}_{secondTableName}
   */
  joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string,
    secondPropertyName: string,
  ): string {
    return `${firstTableName}_${secondTableName}`;
  }

  /**
   * Join table column name
   */
  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ): string {
    return this.toSnakeCase(tableName) + '_' + (columnName || propertyName);
  }
}
