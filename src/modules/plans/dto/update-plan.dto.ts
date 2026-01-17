import { PartialType } from '@nestjs/swagger';
import { CreatePlanDto } from './create-plan.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  @ApiPropertyOptional({ description: 'Whether the plan is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
