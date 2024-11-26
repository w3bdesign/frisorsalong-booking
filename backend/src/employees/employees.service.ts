import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual, MoreThanOrEqual, Not, FindOptionsWhere } from "typeorm";
import { Employee } from "./entities/employee.entity";
import { Booking, BookingStatus } from "../bookings/entities/booking.entity";
import { UserRole, User } from "../users/entities/user.entity";

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

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private generateTemporaryPassword(): string {
    // Generate a random password with at least one uppercase, one lowercase, one number
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    
    // Ensure at least one uppercase
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    // Ensure at least one lowercase
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    // Ensure at least one number
    password += "0123456789"[Math.floor(Math.random() * 10)];
    
    // Fill the rest with random characters
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<CreateEmployeeResponse> {
    // Check if employee with email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createEmployeeDto.email }
    });

    if (existingUser) {
      throw new ConflictException('En bruker med denne e-postadressen eksisterer allerede');
    }

    const temporaryPassword = this.generateTemporaryPassword();

    // Create new user
    const user = this.userRepository.create({
      firstName: createEmployeeDto.firstName,
      lastName: createEmployeeDto.lastName,
      email: createEmployeeDto.email,
      role: UserRole.EMPLOYEE,
      password: temporaryPassword
    });

    await this.userRepository.save(user);

    // Create new employee
    const employee = this.employeeRepository.create({
      user,
      specializations: createEmployeeDto.specializations,
      isActive: createEmployeeDto.isActive ?? true,
      availability: createEmployeeDto.availability ?? {}
    });

    const savedEmployee = await this.employeeRepository.save(employee);

    return {
      employee: savedEmployee,
      temporaryPassword
    };
  }

  async resetPassword(id: string): Promise<string> {
    const employee = await this.findOne(id);
    
    const temporaryPassword = this.generateTemporaryPassword();
    
    // Update user's password
    employee.user.password = temporaryPassword;
    await this.userRepository.save(employee.user);
    
    return temporaryPassword;
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!employee) {
      throw new NotFoundException(`Fant ikke ansatt med ID ${id}`);
    }

    return employee;
  }

  async isAvailable(
    employeeId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string,
  ): Promise<boolean> {
    const whereClause: FindOptionsWhere<Booking> = {
      employee: { id: employeeId },
      status: Not(BookingStatus.CANCELLED),
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
      order: {
        user: {
          firstName: "ASC",
          lastName: "ASC"
        }
      }
    });
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);

    // If email is being updated, check for conflicts
    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateEmployeeDto.email }
      });

      if (existingUser && existingUser.id !== employee.user.id) {
        throw new ConflictException('En bruker med denne e-postadressen eksisterer allerede');
      }
    }

    // Update employee properties
    if (updateEmployeeDto.specializations !== undefined) {
      employee.specializations = updateEmployeeDto.specializations;
    }
    if (updateEmployeeDto.isActive !== undefined) {
      employee.isActive = updateEmployeeDto.isActive;
    }
    if (updateEmployeeDto.availability !== undefined) {
      employee.availability = updateEmployeeDto.availability;
    }

    // Update user properties
    if (updateEmployeeDto.firstName !== undefined) {
      employee.user.firstName = updateEmployeeDto.firstName;
    }
    if (updateEmployeeDto.lastName !== undefined) {
      employee.user.lastName = updateEmployeeDto.lastName;
    }
    if (updateEmployeeDto.email !== undefined) {
      employee.user.email = updateEmployeeDto.email;
    }

    // Save user changes
    await this.userRepository.save(employee.user);

    // Save and return employee changes
    return this.employeeRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    
    // Check for future bookings
    const whereClause: FindOptionsWhere<Booking> = {
      employee: { id },
      startTime: MoreThanOrEqual(new Date()),
      status: Not(BookingStatus.CANCELLED)
    };

    const futureBookings = await this.bookingRepository.count({
      where: whereClause
    });

    if (futureBookings > 0) {
      throw new ConflictException('Kan ikke slette ansatt med fremtidige bestillinger');
    }

    // Instead of deleting, mark as inactive and archive
    employee.isActive = false;
    await this.employeeRepository.save(employee);
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
        isActive: true
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
