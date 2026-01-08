import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  MaxLength,
  MinLength,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

/**
 * DTO for creating a new user
 */
export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User first name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  first_name: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  last_name: string;

  @ApiPropertyOptional({ description: 'User role', default: 'operator' })
  @IsOptional()
  @IsString()
  @IsIn(['admin', 'manager', 'supervisor', 'operator'])
  role?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ description: 'Location ID' })
  @IsOptional()
  @IsUUID()
  location_id?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatar_url?: string;
}

/**
 * DTO for updating a user
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'Is user active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

/**
 * DTO for user response
 */
export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  role: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  avatar_url?: string;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  company_id: string;

  @ApiPropertyOptional()
  location_id?: string;

  @ApiPropertyOptional()
  last_login_at?: Date;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
