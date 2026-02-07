import { ApiProperty } from '@nestjs/swagger';

export class TimeSegmentExpandedDto {
  @ApiProperty({ example: 101 })
  id: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  workOrderId: string;

  @ApiProperty({ example: '2023-10-27T08:30:00.000Z' })
  startTime: string;

  @ApiProperty({ example: '2023-10-27T12:00:00.000Z', nullable: true })
  endTime: string | null;

  @ApiProperty({ example: 150 })
  qtyCompleted: number;

  @ApiProperty({ example: 0 })
  downTimeMinutes: number;

  @ApiProperty({ example: 'Smooth run', nullable: true })
  notes: string | null;

  @ApiProperty({ example: 'Molding', nullable: true })
  step: string | null;

  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    nullable: true,
  })
  operatorId: string | null;

  @ApiProperty({ example: 'Jane Doe', nullable: true })
  operatorName: string | null;

  @ApiProperty({ example: 'Press-04', nullable: true })
  machineName: string | null;

  @ApiProperty({
    example: 'b390f1ee-6c54-4b01-90e6-d701748f0852',
    nullable: true,
  })
  equipmentId: string | null;
}

export class TimeSegmentsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [TimeSegmentExpandedDto] })
  data: TimeSegmentExpandedDto[];
}
