import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CompanyResponseDto,
  UpdateCompanyDto,
} from '../modules/companies/dto/company.dto';

export const CompaniesSwagger = {
  getCurrent: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get current user company' }),
      ApiResponse({
        status: 200,
        description: 'Company retrieved successfully',
        type: CompanyResponseDto,
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Company not found' }),
      ApiBearerAuth(),
    ),
  update: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update company details' }),
      ApiParam({ name: 'id', description: 'Company UUID' }),
      ApiBody({ type: UpdateCompanyDto }),
      ApiResponse({
        status: 200,
        description: 'Company updated successfully',
        type: CompanyResponseDto,
      }),
      ApiResponse({ status: 400, description: 'Invalid data' }),
      ApiResponse({ status: 404, description: 'Company not found' }),
      ApiBearerAuth(),
    ),
};
