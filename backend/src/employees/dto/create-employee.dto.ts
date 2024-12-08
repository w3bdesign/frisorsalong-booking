import { IsString, IsOptional, IsObject, IsBoolean, IsEmail, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

interface TimeSlot {
  start: string;
  end: string;
}

interface Availability {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

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

  @ApiPropertyOptional({
    description: 'Employee availability schedule',
    example: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
    }
  })
  @IsOptional()
  @IsObject()
  availability?: Availability;

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
    availability?: Availability;
    isActive: boolean;
  };
  temporaryPassword?: string;
}
