import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WorkOrderStatusResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() code: string;
  @Expose() @ApiProperty() color: string;
  @Expose() @ApiProperty() description: string;
  @Expose() @ApiProperty() isDefault: boolean;
  @Expose() @ApiProperty() fontColor: string;
  @Expose() @ApiProperty() borderColor: string;
  @Expose() @ApiProperty() fontWeight: string;
  @Expose() @ApiProperty() isFlashing: boolean;
  @Expose() @ApiProperty({ enum: ['default', 'custom'] }) statusType: string;
}
