import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';

// UpdateEmployeeDto will have all the properties from CreateEmployeeDto but optional
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
