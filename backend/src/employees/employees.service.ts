import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual, MoreThanOrEqual, Not } from "typeorm";
import { Employee } from "./entities/employee.entity";
import { Booking } from "../bookings/entities/booking.entity";

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async isAvailable(
    employeeId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string,
  ): Promise<boolean> {
    const whereClause: any = {
      employee: { id: employeeId },
      status: Not("cancelled"),
      startTime: LessThanOrEqual(endTime),
      endTime: MoreThanOrEqual(startTime),
    };

    // Exclude current booking when checking availability for updates
    if (excludeBookingId) {
      whereClause.id = Not(excludeBookingId);
    }

    const conflictingBookings = await this.bookingRepository.count({
      where: whereClause,
    });

    return conflictingBookings === 0;
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      relations: ["user"],
    });
  }

  async findAvailableForService(
    serviceId: string,
    startTime: Date,
  ): Promise<Employee[]> {
    const employees = await this.employeeRepository.find({
      relations: ["services"],
      where: {
        services: {
          id: serviceId,
        },
      },
    });

    const availableEmployees = [];
    for (const employee of employees) {
      // Calculate end time based on service duration (this should be fetched from service)
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Assuming 1 hour duration
      const isAvailable = await this.isAvailable(
        employee.id,
        startTime,
        endTime,
      );
      if (isAvailable) {
        availableEmployees.push(employee);
      }
    }

    return availableEmployees;
  }
}
