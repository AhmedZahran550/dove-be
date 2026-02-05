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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsSwagger } from '@/swagger/departments.swagger';
import { DepartmentsService } from './departments.service';
import { Department } from '../../database/entities';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';

import { Cacheable, CacheEvict } from '@/common/decorators/cache.decorator';
import { Paginate, QueryOptions } from '@/common/query-options';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';

// ...

@ApiTags('departments')
@Controller('departments')
@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
@ApiBearerAuth('JWT-auth')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN, Role.OPERATOR, Role.USER)
  @Cacheable({ key: 'departments:all', ttl: 60 })
  @DepartmentsSwagger.findAll()
  async findAll(
    @AuthUser() user: UserProfile,
    @Paginate() query: QueryOptions,
  ) {
    return this.departmentsService.findByCompany(user.companyId, query);
  }

  @Get('filter-options')
  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN, Role.OPERATOR, Role.USER)
  @Cacheable({ key: 'departments:filter-options', ttl: 3600 })
  @DepartmentsSwagger.getFilterOptions()
  async getFilterOptions(@AuthUser() user: UserProfile) {
    return this.departmentsService.getFilterOptions(user.companyId);
  }

  @Get(':id')
  @Cacheable({ key: 'departments:{{id}}', ttl: 2592000 })
  @DepartmentsSwagger.findById()
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<Department> {
    return this.departmentsService.findDepartmentById(id, user.companyId);
  }

  @Post()
  @CacheEvict('departments:all')
  @DepartmentsSwagger.create()
  async create(
    @Body() dto: CreateDepartmentDto,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean; data: Department; message: string }> {
    const department = await this.departmentsService.createDepartment(
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
  @CacheEvict('departments:all', 'departments:{{id}}')
  @DepartmentsSwagger.update()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
    @AuthUser() user: UserProfile,
  ): Promise<Department> {
    return this.departmentsService.updateDepartment(id, user.companyId, dto);
  }

  @Delete(':id')
  @CacheEvict('departments:all', 'departments:{{id}}')
  @DepartmentsSwagger.delete()
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean; message: string }> {
    await this.departmentsService.deleteDepartment(id, user.companyId);
    return {
      success: true,
      message: 'Department deleted successfully',
    };
  }
}
