import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export type AvailabilitySchedule = {
  [key: string]: Array<{ start: string; end: string }>;
};

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsArray()
  @IsString({ each: true })
  specializations: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsOptional()
  availability?: AvailabilitySchedule;
}
