import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, MoreThan, LessThan } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<{ employee: Employee; temporaryPassword: string }> {
    const employee = this.employeeRepository.create(createEmployeeDto);
    const savedEmployee = await this.employeeRepository.save(employee);
    const temporaryPassword = Math.random().toString(36).slice(-8);
    
    return {
      employee: savedEmployee,
      temporaryPassword
    };
  }

  async findAll(): Promise<Employee[]> {
    const employees = await this.employeeRepository.find({
      relations: ['user', 'services'],
      where: { isActive: true },
    });
    return employees;
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['user', 'services'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee #${id} not found`);
    }

    return employee;
  }

  async findByUserId(userId: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'services'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with user ID ${userId} not found`);
    }

    return employee;
  }

  async isAvailable(
    employeeId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ): Promise<boolean> {
    const employee = await this.findOne(employeeId);
    
    // Check if the employee is active
    if (!employee.isActive) {
      return false;
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = startTime.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    // Check if employee has availability for this day
    const dayAvailability = employee.availability?.[dayName];
    if (!dayAvailability || dayAvailability.length === 0) {
      return false;
    }

    // Check if the booking time falls within any of the available time slots
    const bookingStart = startTime.getHours() * 60 + startTime.getMinutes();
    const bookingEnd = endTime.getHours() * 60 + endTime.getMinutes();

    const isWithinAvailability = dayAvailability.some(slot => {
      const [startHour, startMinute] = slot.start.split(':').map(Number);
      const [endHour, endMinute] = slot.end.split(':').map(Number);
      const slotStart = startHour * 60 + startMinute;
      const slotEnd = endHour * 60 + endMinute;

      return bookingStart >= slotStart && bookingEnd <= slotEnd;
    });

    if (!isWithinAvailability) {
      return false;
    }

    // Check for overlapping bookings
    const whereCondition: any = {
      employee: { id: employeeId },
      startTime: Not(MoreThan(endTime)),
      endTime: Not(LessThan(startTime)),
    };

    // Exclude the current booking if an ID is provided
    if (excludeBookingId) {
      whereCondition.id = Not(excludeBookingId);
    }

    const overlappingBookings = await this.bookingRepository.count({
      where: whereCondition,
    });

    return overlappingBookings === 0;
  }

  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    const employee = await this.findOne(id);
    const temporaryPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    await this.userRepository.update(employee.user.id, {
      password: hashedPassword
    });

    return { temporaryPassword };
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);
    const updated = Object.assign(employee, updateEmployeeDto);
    return await this.employeeRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    employee.isActive = false;
    await this.employeeRepository.save(employee);
  }

  async restore(id: string): Promise<void> {
    const employee = await this.findOne(id);
    employee.isActive = true;
    await this.employeeRepository.save(employee);
  }
}
