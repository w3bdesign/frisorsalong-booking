import { DataSource } from "typeorm";
import { User, UserRole } from "../../users/entities/user.entity";
import { Employee } from "../../employees/entities/employee.entity";
import { Service } from "../../services/entities/service.entity";
import * as bcrypt from "bcrypt";

export const createInitialData = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);
  const employeeRepository = dataSource.getRepository(Employee);
  const serviceRepository = dataSource.getRepository(Service);

  try {
    const employeeEmail = process.env.EMPLOYEE_EMAIL;
    const employeePassword = process.env.EMPLOYEE_PASSWORD;

    if (!employeeEmail || !employeePassword) {
      throw new Error(
        "Employee email and password must be set in environment variables",
      );
    }

    // Create services
    const services = await serviceRepository.save([
      {
        name: "Haircut",
        description: "Basic haircut service",
        price: 30.0,
        duration: 30,
        isActive: true,
      },
      {
        name: "Hair Coloring",
        description: "Professional hair coloring service",
        price: 80.0,
        duration: 120,
        isActive: true,
      },
      {
        name: "Styling",
        description: "Hair styling service",
        price: 40.0,
        duration: 45,
        isActive: true,
      },
    ]);

    // Check if employee user already exists
    const existingEmployee = await userRepository.findOne({
      where: { email: employeeEmail },
    });

    if (!existingEmployee) {
      // Create employee user
      const hashedPassword = await bcrypt.hash(employeePassword, 10);
      const employeeUser = await userRepository.save({
        firstName: "John",
        lastName: "Doe",
        email: employeeEmail,
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
        phoneNumber: process.env.EMPLOYEE_PHONE || "+1234567890",
      });

      // Create employee
      const employee = await employeeRepository.save({
        user: employeeUser,
        specializations: ["haircut", "coloring"],
        availability: {
          monday: [{ start: "09:00", end: "17:00" }],
          tuesday: [{ start: "09:00", end: "17:00" }],
          wednesday: [{ start: "09:00", end: "17:00" }],
          thursday: [{ start: "09:00", end: "17:00" }],
          friday: [{ start: "09:00", end: "17:00" }],
        },
        isActive: true,
      });

      // Associate services with employee
      await dataSource
        .createQueryBuilder()
        .insert()
        .into("employee_services")
        .values(
          services.map((service) => ({
            employee_id: employee.id,
            service_id: service.id,
          })),
        )
        .execute();

      console.log("Initial data seeded successfully");
    } else {
      console.log("Employee user already exists");
    }
  } catch (error) {
    console.error("Error creating initial data:", error);
    throw error;
  }
};
