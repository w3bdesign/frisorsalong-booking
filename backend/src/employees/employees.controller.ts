import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Employee } from './entities/employee.entity';

interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  specializations: string[];
  isActive?: boolean;
  availability?: {
    [key: string]: Array<{ start: string; end: string }>;
  };
}

interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

interface CreateEmployeeResponse {
  employee: Employee;
  temporaryPassword: string;
}

interface ResetPasswordResponse {
  temporaryPassword: string;
}

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<CreateEmployeeResponse> {
    try {
      const result = await this.employeesService.create(createEmployeeDto);
      console.log('Create employee result:', {
        ...result,
        temporaryPassword: result.temporaryPassword ? '[HIDDEN]' : undefined
      }); // Debug log without exposing password
      return result;
    } catch (error) {
      if (error.message === 'User with this email already exists') {
        error.message = 'En bruker med denne e-postadressen eksisterer allerede';
      }
      throw error;
    }
  }

  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string): Promise<ResetPasswordResponse> {
    try {
      const result = await this.employeesService.resetPassword(id);
      return { temporaryPassword: result };
    } catch (error) {
      if (error.message.includes('not found')) {
        error.message = `Fant ikke ansatt med ID ${id}`;
      }
      throw error;
    }
  }

  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.employeesService.findOne(id);
    } catch (error) {
      if (error.message.includes('not found')) {
        error.message = `Fant ikke ansatt med ID ${id}`;
      }
      throw error;
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    try {
      return await this.employeesService.update(id, updateEmployeeDto);
    } catch (error) {
      if (error.message === 'User with this email already exists') {
        error.message = 'En bruker med denne e-postadressen eksisterer allerede';
      } else if (error.message.includes('not found')) {
        error.message = `Fant ikke ansatt med ID ${id}`;
      }
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.employeesService.remove(id);
    } catch (error) {
      if (error.message === 'Cannot delete employee with future bookings') {
        error.message = 'Kan ikke slette ansatt med fremtidige bestillinger';
      } else if (error.message.includes('not found')) {
        error.message = `Fant ikke ansatt med ID ${id}`;
      }
      throw error;
    }
  }
}
