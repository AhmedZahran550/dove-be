import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ConditionalStatusRuleResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() ruleName: string;
  @Expose() @ApiProperty() description: string;
  @Expose() @ApiProperty() statusName: string;
  @Expose() @ApiProperty() priority: number;
  @Expose() @ApiProperty() isActive: boolean;
  @Expose() @ApiProperty() conditions: any;
  @Expose() @ApiProperty() companyId: string;
}
