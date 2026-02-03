import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ConditionalStatusRuleResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose({ name: 'rule_name' }) @ApiProperty() ruleName: string;
  @Expose() @ApiProperty() description: string;
  @Expose({ name: 'status_name' }) @ApiProperty() statusName: string;
  @Expose() @ApiProperty() priority: number;
  @Expose({ name: 'is_active' }) @ApiProperty() isActive: boolean;
  @Expose() @ApiProperty() conditions: any;
  @Expose({ name: 'company_id' }) @ApiProperty() companyId: string;
}
