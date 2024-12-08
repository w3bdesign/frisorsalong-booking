import { Test, TestingModule } from "@nestjs/testing";
import { EmployeesController } from "./employees.controller";
import { EmployeesService } from "./employees.service";
import {
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { Employee } from "./entities/employee.entity";
import { User, UserRole } from "../users/entities/user.entity";
import * as bcrypt from "bcrypt";

interface MockUser extends Omit<User, "hashPassword" | "validatePassword"> {
  hashPassword: () => Promise<void>;
  validatePassword: (password: string) => Promise<boolean>;
}

describe("EmployeesController", () => {
  let controller: EmployeesController;
  let service: EmployeesService;

  const createMockUser = (data: Partial<User>): MockUser => {
    const user: MockUser = {
      id: "default-id",
      firstName: "Default",
      lastName: "User",
      email: "default@example.com",
      password: "password",
      role: UserRole.CUSTOMER,
      phoneNumber: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      hashPassword: async function () {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
      },
      validatePassword: async function (password) {
        return bcrypt.compare(password, user.password);
      },
      ...data,
    };
    return user;
  };

  const mockAdminUser = createMockUser({
    id: "admin-id",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: UserRole.ADMIN,
  });

  const mockEmployeeUser = createMockUser({
    id: "employee-id",
    email: "employee@example.com",
    firstName: "John",
    lastName: "Doe",
    role: UserRole.EMPLOYEE,
  });

  const mockEmployee = {
    id: "employee-1",
    user: mockEmployeeUser,
    specializations: ["haircut"],
    isActive: true,
    availability: {},
  } as Employee;

  const mockEmployeesService = {
    create: jest.fn(),
    resetPassword: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
    service = module.get<EmployeesService>(EmployeesService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    const createEmployeeDto = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      specializations: ["haircut"],
    };

    const createResponse = {
      employee: mockEmployee,
      temporaryPassword: "temp123",
    };

    it("should create an employee successfully", async () => {
      mockEmployeesService.create.mockResolvedValue(createResponse);

      const result = await controller.create(createEmployeeDto);

      expect(result).toEqual(createResponse);
      expect(service.create).toHaveBeenCalledWith(createEmployeeDto);
    });

    it("should handle duplicate email error", async () => {
      mockEmployeesService.create.mockRejectedValue(
        new ConflictException(
          "En bruker med denne e-postadressen eksisterer allerede"
        )
      );

      await expect(controller.create(createEmployeeDto)).rejects.toThrow(
        "En bruker med denne e-postadressen eksisterer allerede"
      );
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      const resetResponse = { temporaryPassword: "newTemp123" };
      mockEmployeesService.resetPassword.mockResolvedValue(resetResponse);

      const result = await controller.resetPassword("employee-1");

      expect(result).toEqual(resetResponse);
      expect(service.resetPassword).toHaveBeenCalledWith("employee-1");
    });

    it("should handle employee not found error", async () => {
      mockEmployeesService.resetPassword.mockRejectedValue(
        new NotFoundException("Fant ikke ansatt med ID non-existent")
      );

      await expect(controller.resetPassword("non-existent")).rejects.toThrow(
        "Fant ikke ansatt med ID non-existent"
      );
    });
  });

  describe("findAll", () => {
    it("should return all employees", async () => {
      const employees = [mockEmployee];
      mockEmployeesService.findAll.mockResolvedValue(employees);

      const result = await controller.findAll();

      expect(result).toEqual(employees);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should return an employee by id for admin user", async () => {
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);

      const result = await controller.findOne("employee-1", mockAdminUser);

      expect(result).toEqual(mockEmployee);
      expect(service.findOne).toHaveBeenCalledWith("employee-1");
      expect(service.findByUserId).not.toHaveBeenCalled();
    });

    it("should allow employee to access their own record", async () => {
      const employeeUser = mockEmployeeUser;
      const employeeRecord = { ...mockEmployee, id: "employee-1" };

      mockEmployeesService.findByUserId.mockResolvedValue(employeeRecord);
      mockEmployeesService.findOne.mockResolvedValue(employeeRecord);

      const result = await controller.findOne("employee-1", employeeUser);

      expect(result).toEqual(employeeRecord);
      expect(service.findByUserId).toHaveBeenCalledWith(employeeUser.id);
      expect(service.findOne).toHaveBeenCalledWith("employee-1");
    });

    it("should not allow employee to access other employee records", async () => {
      const employeeUser = createMockUser({
        id: "different-employee-id",
        email: "other@example.com",
        firstName: "Other",
        lastName: "Employee",
        role: UserRole.EMPLOYEE,
      });

      const ownEmployeeRecord = {
        ...mockEmployee,
        id: "own-employee-id",
        user: employeeUser,
      };

      mockEmployeesService.findByUserId.mockResolvedValue(ownEmployeeRecord);

      await expect(
        controller.findOne("other-employee-id", employeeUser)
      ).rejects.toThrow(
        new UnauthorizedException(
          "Du har ikke tilgang til å se denne ansattes informasjon"
        )
      );

      expect(service.findByUserId).toHaveBeenCalledWith(employeeUser.id);
      expect(service.findOne).not.toHaveBeenCalled();
    });

    it("should handle employee not found for findByUserId", async () => {
      const employeeUser = createMockUser({
        id: "employee-id",
        role: UserRole.EMPLOYEE,
      });

      mockEmployeesService.findByUserId.mockResolvedValue(null);

      await expect(
        controller.findOne("employee-1", employeeUser)
      ).rejects.toThrow(
        new UnauthorizedException(
          "Du har ikke tilgang til å se denne ansattes informasjon"
        )
      );

      expect(service.findByUserId).toHaveBeenCalledWith(employeeUser.id);
      expect(service.findOne).not.toHaveBeenCalled();
    });

    it("should handle employee not found error", async () => {
      mockEmployeesService.findOne.mockRejectedValue(
        new NotFoundException("Fant ikke ansatt med ID non-existent")
      );

      await expect(
        controller.findOne("non-existent", mockAdminUser)
      ).rejects.toThrow("Fant ikke ansatt med ID non-existent");
    });
  });

  describe("update", () => {
    const updateEmployeeDto = {
      firstName: "John Updated",
      email: "john.updated@example.com",
    };

    it("should update an employee successfully", async () => {
      const updatedEmployee = { ...mockEmployee, ...updateEmployeeDto };
      mockEmployeesService.update.mockResolvedValue(updatedEmployee);

      const result = await controller.update("employee-1", updateEmployeeDto);

      expect(result).toEqual(updatedEmployee);
      expect(service.update).toHaveBeenCalledWith(
        "employee-1",
        updateEmployeeDto
      );
    });

    it("should handle duplicate email error", async () => {
      mockEmployeesService.update.mockRejectedValue(
        new ConflictException(
          "En bruker med denne e-postadressen eksisterer allerede"
        )
      );

      await expect(
        controller.update("employee-1", updateEmployeeDto)
      ).rejects.toThrow(
        "En bruker med denne e-postadressen eksisterer allerede"
      );
    });

    it("should handle employee not found error", async () => {
      mockEmployeesService.update.mockRejectedValue(
        new NotFoundException("Fant ikke ansatt med ID non-existent")
      );

      await expect(
        controller.update("non-existent", updateEmployeeDto)
      ).rejects.toThrow("Fant ikke ansatt med ID non-existent");
    });
  });

  describe("remove", () => {
    it("should remove an employee successfully", async () => {
      mockEmployeesService.remove.mockResolvedValue(undefined);

      await controller.remove("employee-1");

      expect(service.remove).toHaveBeenCalledWith("employee-1");
    });

    it("should handle employee with future bookings error", async () => {
      mockEmployeesService.remove.mockRejectedValue(
        new BadRequestException(
          "Kan ikke slette ansatt med fremtidige bestillinger"
        )
      );

      await expect(controller.remove("employee-1")).rejects.toThrow(
        "Kan ikke slette ansatt med fremtidige bestillinger"
      );
    });

    it("should handle employee not found error", async () => {
      mockEmployeesService.remove.mockRejectedValue(
        new NotFoundException("Fant ikke ansatt med ID non-existent")
      );

      await expect(controller.remove("non-existent")).rejects.toThrow(
        "Fant ikke ansatt med ID non-existent"
      );
    });
  });

  describe("restore", () => {
    it("should restore an employee successfully", async () => {
      mockEmployeesService.restore.mockResolvedValue(undefined);

      await controller.restore("employee-1");

      expect(service.restore).toHaveBeenCalledWith("employee-1");
    });

    it("should handle employee not found error", async () => {
      mockEmployeesService.restore.mockRejectedValue(
        new NotFoundException("Fant ikke ansatt med ID non-existent")
      );

      await expect(controller.restore("non-existent")).rejects.toThrow(
        "Fant ikke ansatt med ID non-existent"
      );
    });
  });
});
