import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('departments')
@Controller('departments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments for current company' })
  async findAll(@CurrentUser() user: User): Promise<{
    success: boolean;
    data: Department[];
    count: number;
  }> {
    const departments = await this.departmentsService.findByCompany(
      user.company_id,
    );
    return {
      success: true,
      data: departments,
      count: departments.length,
    };
  }

  @Get('filter-options')
  @ApiOperation({ summary: 'Get available filter options for departments' })
  async getFilterOptions(@CurrentUser() user: User) {
    return this.departmentsService.getFilterOptions(user.company_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a department by ID' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Department> {
    return this.departmentsService.findById(id, user.company_id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  async create(
    @Body() dto: CreateDepartmentDto,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; data: Department; message: string }> {
    const department = await this.departmentsService.create(
      user.company_id,
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
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
    @CurrentUser() user: User,
  ): Promise<Department> {
    return this.departmentsService.update(id, user.company_id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a department (soft delete)' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; message: string }> {
    await this.departmentsService.delete(id, user.company_id);
    return {
      success: true,
      message: 'Department deleted successfully',
    };
  }
}

