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
  operator_id: string;

  @ApiProperty({ description: 'First Name' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ description: 'Last Name' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

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
  employee_type?: string;

  @ApiPropertyOptional({ description: 'Shift (Day, Night, etc.)' })
  @IsString()
  @IsOptional()
  shift?: string;

  @ApiPropertyOptional({ description: 'Date of Birth' })
  @IsDateString()
  @IsOptional()
  date_of_birth?: Date;

  @ApiPropertyOptional({ description: 'Hire Date' })
  @IsDateString()
  @IsOptional()
  hire_date?: Date;

  @ApiPropertyOptional({ description: 'Company Employee ID' })
  @IsString()
  @IsOptional()
  company_employee_id?: string;

  @ApiPropertyOptional({ description: 'Status', default: 'active' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Default Location ID' })
  @IsUUID()
  @IsOptional()
  default_location_id?: string;

  // company_id is handled by the controller from the authenticated user
  company_id?: string;
}
