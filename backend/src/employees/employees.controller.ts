import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { Employee } from './entities/employee.entity';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<{ employee: Employee; temporaryPassword: string }> {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<Employee[]> {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  async findOne(@Param('id') id: string, @GetUser() user: User): Promise<Employee> {
    // Allow employees to only access their own record
    if (user.role === UserRole.EMPLOYEE) {
      const employee = await this.employeesService.findByUserId(user.id);
      if (!employee || employee.id !== id) {
        throw new UnauthorizedException('Du har ikke tilgang til å se denne ansattes informasjon');
      }
    }
    return this.employeesService.findOne(id);
  }

  @Post(':id/reset-password')
  @Roles(UserRole.ADMIN)
  async resetPassword(@Param('id') id: string): Promise<{ temporaryPassword: string }> {
    return this.employeesService.resetPassword(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    return this.employeesService.remove(id);
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  async restore(@Param('id') id: string): Promise<void> {
    return this.employeesService.restore(id);
  }
}
