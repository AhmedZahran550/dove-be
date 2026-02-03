import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PartNumbersSwagger } from '@/swagger/part-numbers.swagger';
import { PartNumbersService } from './part-numbers.service';
import { UserProfile } from '../../database/entities';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { QueryOptions, Paginate } from '../../common/query-options';
import { plainToInstance } from 'class-transformer';
import { PartNumberResponseDto } from './dto/part-number-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';

@ApiTags('part-numbers')
@Controller('part-numbers')
@ApiBearerAuth('JWT-auth')
@Roles(Role.LOCATION_ADMIN, Role.COMPANY_ADMIN)
export class PartNumbersController {
  constructor(private readonly partNumbersService: PartNumbersService) {}

  @Get()
  @PartNumbersSwagger.findAll()
  async findAll(
    @Paginate() query: QueryOptions,
    @AuthUser() user: UserProfile,
  ) {
    const qb = this.partNumbersService.getQueryBuilder({ alias: 'partNumber' });
    qb.where('partNumber.companyId = :companyId', {
      companyId: user.companyId,
    });

    const result = await this.partNumbersService.findAll(query, qb);
    return {
      ...result,
      data: plainToInstance(PartNumberResponseDto, result.data, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
