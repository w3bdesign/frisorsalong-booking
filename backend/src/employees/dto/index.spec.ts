import * as DTOs from './index';
import { CreateEmployeeDto } from './create-employee.dto';
import { UpdateEmployeeDto } from './update-employee.dto';

describe('DTO Index', () => {
  it('should export CreateEmployeeDto', () => {
    expect(DTOs.CreateEmployeeDto).toBeDefined();
    expect(DTOs.CreateEmployeeDto).toBe(CreateEmployeeDto);
  });

  it('should export UpdateEmployeeDto', () => {
    expect(DTOs.UpdateEmployeeDto).toBeDefined();
    expect(DTOs.UpdateEmployeeDto).toBe(UpdateEmployeeDto);
  });
});
