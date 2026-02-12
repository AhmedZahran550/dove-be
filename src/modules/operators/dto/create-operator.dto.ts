import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOperatorDto {
  @ApiProperty({ description: 'Operator ID/Badge Number' })
  @IsString()
  @IsNotEmpty()
  operatorId: string;

  @ApiProperty({ description: 'First Name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last Name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Job Position' })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({
    description: 'Employee Type (Full-time, Part-time, etc.)',
  })
  @IsString()
  @IsOptional()
  employeeType?: string;

  @ApiPropertyOptional({ description: 'Shift (Day, Night, etc.)' })
  @IsString()
  @IsOptional()
  shift?: string;

  @ApiPropertyOptional({ description: 'Date of Birth' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ description: 'Hire Date' })
  @IsDateString()
  @IsOptional()
  hireDate?: Date;

  @ApiPropertyOptional({ description: 'Company Employee ID' })
  @IsString()
  @IsOptional()
  companyEmployeeId?: string;

  @ApiPropertyOptional({ description: 'Status', default: 'active' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Default Location ID' })
  @IsUUID()
  @IsOptional()
  defaultLocationId?: string;

  // company_id is handled by the controller from the authenticated user
  companyId?: string;
}
