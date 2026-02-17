import { PartialType } from '@nestjs/swagger';
import { CreateDowntimeReasonDto } from './create-downtime-reason.dto';

export class UpdateDowntimeReasonDto extends PartialType(
  CreateDowntimeReasonDto,
) {}
