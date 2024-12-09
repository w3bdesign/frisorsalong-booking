import { DataSource, Repository, EntityTarget } from "typeorm";
import { User, UserRole } from "../../users/entities/user.entity";
import { Employee } from "../../employees/entities/employee.entity";
import { Service } from "../../services/entities/service.entity";
import { createInitialData } from "./create-initial-data.seed";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt");

interface RepositoryMapping {
  User: Repository<User>;
  Employee: Repository<Employee>;
  Service: Repository<Service>;
}

type SupportedEntity = User | Employee | Service;

function getEntityName(entity: EntityTarget<SupportedEntity>): keyof RepositoryMapping {
  if (typeof entity === "function") {
    return entity.name as keyof RepositoryMapping;
  }
  throw new Error("Unsupported entity type");
}

describe("createInitialData", () => {
  let mockDataSource: Partial<DataSource>;
  let mockUserRepository: Partial<Repository<User>>;
  let mockEmployeeRepository: Partial<Repository<Employee>>;
  let mockServiceRepository: Partial<Repository<Service>>;
  let mockQueryBuilder: {
    insert: jest.Mock;
    into: jest.Mock;
    values: jest.Mock;
    execute: jest.Mock;
  };
  const originalEnv = process.env;

  beforeEach(() => {
    // Mock repositories with proper typing
    mockUserRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest
        .fn()
        .mockImplementation((data: Partial<User>): Promise<User> =>
          Promise.resolve({ id: "user-1", ...data } as User)
        ),
    };

    mockEmployeeRepository = {
      save: jest
        .fn()
        .mockImplementation((data: Partial<Employee>): Promise<Employee> =>
          Promise.resolve({ id: "employee-1", ...data } as Employee)
        ),
    };

    mockServiceRepository = {
      save: jest
        .fn()
        .mockImplementation((services: Partial<Service> | Partial<Service>[]): Promise<Service | Service[]> =>
          Promise.resolve(
            Array.isArray(services)
              ? services.map((s, i) => ({ ...s, id: `service-${i + 1}` } as Service))
              : { ...services, id: 'service-1' } as Service
          )
        ),
    };

    // Mock query builder for service associations
    mockQueryBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    };

    // Mock DataSource with proper typing
    const mockGetRepository = <T extends SupportedEntity>(entity: EntityTarget<T>) => {
      const repositories: RepositoryMapping = {
        User: mockUserRepository as Repository<User>,
        Employee: mockEmployeeRepository as Repository<Employee>,
        Service: mockServiceRepository as Repository<Service>,
      };

      const entityName = getEntityName(entity);
      const repository = repositories[entityName];

      if (!repository) {
        throw new Error(`Repository not mocked for entity: ${entityName}`);
      }

      return repository as Repository<T>;
    };

    mockDataSource = {
      getRepository: jest.fn().mockImplementation(mockGetRepository),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    // Mock bcrypt
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

    // Setup test environment variables
    process.env = {
      ...originalEnv,
      EMPLOYEE_EMAIL: "employee@example.com",
      EMPLOYEE_PASSWORD: "employee123",
      EMPLOYEE_PHONE: "+1234567890",
    };

    // Mock console methods
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  test("creates services, employee user, and employee when they do not exist", async () => {
    // Mock that employee doesn't exist
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

    // Mock created services
    const mockServices = [
      { id: "service-1", name: "Standard Klipp" },
      { id: "service-2", name: "Styling Klipp" },
      { id: "service-3", name: "Skjegg Trim" },
      { id: "service-4", name: "Full Service" },
    ];
    (mockServiceRepository.save as jest.Mock).mockResolvedValue(mockServices);

    // Mock created employee user
    const mockEmployeeUser = {
      id: "user-1",
      email: "employee@example.com",
      role: UserRole.EMPLOYEE,
    };
    (mockUserRepository.save as jest.Mock).mockResolvedValue(mockEmployeeUser);

    // Mock created employee
    const mockEmployee = {
      id: "employee-1",
      user: mockEmployeeUser,
    };
    (mockEmployeeRepository.save as jest.Mock).mockResolvedValue(mockEmployee);

    await createInitialData(mockDataSource as DataSource);

    // Verify services were created
    expect(mockServiceRepository.save).toHaveBeenCalledWith([
      expect.objectContaining({ name: "Standard Klipp" }),
      expect.objectContaining({ name: "Styling Klipp" }),
      expect.objectContaining({ name: "Skjegg Trim" }),
      expect.objectContaining({ name: "Full Service" }),
    ]);

    // Verify employee user was created
    expect(mockUserRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "employee@example.com",
        role: UserRole.EMPLOYEE,
      })
    );

    // Verify employee was created
    expect(mockEmployeeRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        user: mockEmployeeUser,
        specializations: ["klipp", "styling", "skjegg"],
      })
    );

    // Verify services were associated with employee
    expect(mockQueryBuilder.insert).toHaveBeenCalled();
    expect(mockQueryBuilder.into).toHaveBeenCalledWith("employee_services");
    expect(mockQueryBuilder.values).toHaveBeenCalledWith(
      mockServices.map((service) => ({
        employee_id: mockEmployee.id,
        service_id: service.id,
      }))
    );

    // Verify success message was logged
    expect(console.log).toHaveBeenCalledWith(
      "Initial data seeded successfully"
    );
  });

  test("does not create employee when it already exists", async () => {
    // Mock that employee already exists
    const existingEmployee = {
      email: "employee@example.com",
      role: UserRole.EMPLOYEE,
    };
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(
      existingEmployee
    );

    await createInitialData(mockDataSource as DataSource);

    // Verify services were still created
    expect(mockServiceRepository.save).toHaveBeenCalled();

    // Verify no employee creation attempts were made
    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(mockEmployeeRepository.save).not.toHaveBeenCalled();
    expect(mockQueryBuilder.insert).not.toHaveBeenCalled();

    // Verify appropriate message was logged
    expect(console.log).toHaveBeenCalledWith("Employee user already exists");
  });

  test("throws error when employee email is missing", async () => {
    delete process.env.EMPLOYEE_EMAIL;

    await expect(
      createInitialData(mockDataSource as DataSource)
    ).rejects.toThrow(
      "Employee email and password must be set in environment variables"
    );

    // Verify no database operations were attempted
    expect(mockServiceRepository.save).not.toHaveBeenCalled();
    expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(mockEmployeeRepository.save).not.toHaveBeenCalled();
  });

  test("throws error when employee password is missing", async () => {
    delete process.env.EMPLOYEE_PASSWORD;

    await expect(
      createInitialData(mockDataSource as DataSource)
    ).rejects.toThrow(
      "Employee email and password must be set in environment variables"
    );

    // Verify no database operations were attempted
    expect(mockServiceRepository.save).not.toHaveBeenCalled();
    expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(mockEmployeeRepository.save).not.toHaveBeenCalled();
  });

  test("handles database errors during service creation", async () => {
    const dbError = new Error("Database error during service creation");
    (mockServiceRepository.save as jest.Mock).mockRejectedValue(dbError);

    await expect(
      createInitialData(mockDataSource as DataSource)
    ).rejects.toThrow(dbError);

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      "Error creating initial data:",
      dbError.message
    );
  });

  test("handles database errors during employee creation", async () => {
    // Mock that employee doesn't exist
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);
    // Mock services creation success
    (mockServiceRepository.save as jest.Mock).mockResolvedValue([]);
    // Mock employee creation error
    const dbError = new Error("Database error during employee creation");
    (mockUserRepository.save as jest.Mock).mockRejectedValue(dbError);

    await expect(
      createInitialData(mockDataSource as DataSource)
    ).rejects.toThrow(dbError);

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      "Error creating initial data:",
      dbError.message
    );
  });

  test("handles password hashing errors", async () => {
    // Mock that employee doesn't exist
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);
    // Mock services creation success
    (mockServiceRepository.save as jest.Mock).mockResolvedValue([]);
    // Mock bcrypt error
    const hashError = new Error("Hashing failed");
    (bcrypt.hash as jest.Mock).mockRejectedValue(hashError);

    await expect(
      createInitialData(mockDataSource as DataSource)
    ).rejects.toThrow(hashError);

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      "Error creating initial data:",
      hashError.message
    );
  });

  test("uses default phone number when EMPLOYEE_PHONE is not set", async () => {
    // Remove EMPLOYEE_PHONE from environment
    delete process.env.EMPLOYEE_PHONE;

    // Mock that employee doesn't exist
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

    // Mock created services
    const mockServices = [{ id: "service-1", name: "Standard Klipp" }];
    (mockServiceRepository.save as jest.Mock).mockResolvedValue(mockServices);

    // Mock created employee user
    const mockEmployeeUser = {
      id: "user-1",
      email: "employee@example.com",
      role: UserRole.EMPLOYEE,
    };
    (mockUserRepository.save as jest.Mock).mockResolvedValue(mockEmployeeUser);

    // Mock created employee
    const mockEmployee = {
      id: "employee-1",
      user: mockEmployeeUser,
    };
    (mockEmployeeRepository.save as jest.Mock).mockResolvedValue(mockEmployee);

    await createInitialData(mockDataSource as DataSource);

    // Verify employee user was created with default phone number
    expect(mockUserRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        phoneNumber: "+1234567890", // This is the default value
      })
    );
  });
});
