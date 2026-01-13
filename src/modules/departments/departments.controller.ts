import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { Department } from '../../database/entities';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';

@ApiTags('departments')
@Controller('departments')
@ApiBearerAuth('JWT-auth')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments for current company' })
  @ApiResponse({
    status: 200,
    description: 'Departments retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@AuthUser() user: UserProfile): Promise<{
    success: boolean;
    data: Department[];
    count: number;
  }> {
    const departments = await this.departmentsService.findByCompany(
      user.companyId,
    );
    return {
      success: true,
      data: departments,
      count: departments.length,
    };
  }

  @Get('filter-options')
  @ApiOperation({ summary: 'Get available filter options for departments' })
  @ApiResponse({
    status: 200,
    description: 'Filter options retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFilterOptions(@AuthUser() user: UserProfile) {
    return this.departmentsService.getFilterOptions(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a department by ID' })
  @ApiResponse({ status: 200, description: 'Department found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<Department> {
    return this.departmentsService.findById(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  async create(
    @Body() dto: CreateDepartmentDto,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean; data: Department; message: string }> {
    const department = await this.departmentsService.create(
      user.companyId,
      dto,
    );
    return {
      success: true,
      data: department,
      message: 'Department created successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
    @AuthUser() user: UserProfile,
  ): Promise<Department> {
    return this.departmentsService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a department (soft delete)' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean; message: string }> {
    await this.departmentsService.delete(id, user.companyId);
    return {
      success: true,
      message: 'Department deleted successfully',
    };
  }
}
