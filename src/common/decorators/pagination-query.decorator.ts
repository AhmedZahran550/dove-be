import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiOkPaginatedResponse,
  ApiPaginationQuery,
  PaginateConfig,
} from 'nestjs-paginate';
import { defaultQueryConfig } from 'src/database/db.service';

export function ApiQuery(
  dto: Type<unknown>,
  paginatedConfig?: PaginateConfig<any>,
) {
  return applyDecorators(
    ApiOkPaginatedResponse(dto, paginatedConfig ?? defaultQueryConfig), // Add the missing paginatedConfig argument
    ApiPaginationQuery(paginatedConfig ?? defaultQueryConfig),
  );
}
