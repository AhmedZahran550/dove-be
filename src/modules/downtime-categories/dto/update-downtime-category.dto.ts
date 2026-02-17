import { PartialType } from '@nestjs/swagger';
import { CreateDowntimeCategoryDto } from './create-downtime-category.dto';

export class UpdateDowntimeCategoryDto extends PartialType(
  CreateDowntimeCategoryDto,
) {}
