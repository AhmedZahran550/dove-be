import { ApiProperty } from '@nestjs/swagger';

export class ScheduleDepartmentSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  departmentName: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  departmentCode: string;

  @ApiProperty()
  targetQty: number;

  @ApiProperty()
  completedQty: number;

  @ApiProperty()
  percentage: number;
}
