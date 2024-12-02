import { IsString, IsOptional, IsObject, IsBoolean, IsEmail, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  specializations: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  availability?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export interface CreateEmployeeResponse {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    specializations: string[];
    availability?: Record<string, any>;
    isActive: boolean;
  };
  temporaryPassword?: string;
}
