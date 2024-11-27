import { validate } from "class-validator";
import { CreateEmployeeDto } from "./create-employee.dto";

describe("CreateEmployeeDto", () => {
  let dto: CreateEmployeeDto;

  beforeEach(() => {
    dto = new CreateEmployeeDto();
    dto.firstName = "John";
    dto.lastName = "Doe";
    dto.email = "john@example.com";
    dto.specializations = ["haircut"];
  });

  it("should validate a valid DTO", async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should require firstName", async () => {
    dto.firstName = "";
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("isNotEmpty");
  });

  it("should require lastName", async () => {
    dto.lastName = "";
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("isNotEmpty");
  });

  it("should require a valid email", async () => {
    dto.email = "invalid-email";
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("isEmail");
  });

  it("should require specializations to be defined", async () => {
    delete dto.specializations;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should require specializations to be an array of strings", async () => {
    dto.specializations = [1, 2, 3] as unknown as string[];
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("isString");
  });

  it("should accept optional isActive", async () => {
    dto.isActive = false;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should accept optional availability", async () => {
    dto.availability = {
      monday: [{ start: "09:00", end: "17:00" }],
    };
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
