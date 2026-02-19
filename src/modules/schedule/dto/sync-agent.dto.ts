import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ConnectorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  connectorTypeId: string;

  @ApiProperty()
  connectionStatus: string;

  @ApiProperty({ nullable: true })
  lastSyncedAt: string | null;
}

export class ConnectorResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: [ConnectorDto] })
  connectors: ConnectorDto[];
}

export class SqliteTableColumnDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;
}

export class SqliteTableDto {
  @ApiProperty()
  rowCount: number;

  @ApiProperty({ type: [SqliteTableColumnDto] })
  columns: SqliteTableColumnDto[];
}

export class SqliteConnectionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  connectionName: string;

  @ApiProperty()
  lastSchemaUpdate: string;

  @ApiProperty({ nullable: true })
  selectedTable: string | null;

  @ApiProperty({ nullable: true })
  trackingColumn: string | null;

  @ApiProperty({ type: 'object', additionalProperties: { $ref: '#/components/schemas/SqliteTableDto' } })
  discoveredTables: Record<string, SqliteTableDto>;
}

export class SqliteConnectionResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: [SqliteConnectionDto] })
  connections: SqliteConnectionDto[];
}

export class UpdateSqliteConnectionDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  selectedTable: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  trackingColumn?: string;
}
