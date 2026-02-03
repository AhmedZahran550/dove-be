import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PartNumberResponseDto } from '@/modules/part-numbers/dto/part-number-response.dto';

export const PartNumbersSwagger = {
  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get all part numbers' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Return all part numbers',
        type: PartNumberResponseDto,
        isArray: true,
      }),
    ),
};
