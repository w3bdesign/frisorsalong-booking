import { validate } from "class-validator";
import { UpdateEmployeeDto } from "./update-employee.dto";

describe("UpdateEmployeeDto", () => {
  let dto: UpdateEmployeeDto;

  beforeEach(() => {
    dto = new UpdateEmployeeDto();
  });

  it("should validate an empty DTO", async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should validate with only firstName", async () => {
    dto.firstName = "John";
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should validate with only lastName", async () => {
    dto.lastName = "Doe";
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should validate with only email", async () => {
    dto.email = "john@example.com";
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should validate with only specializations", async () => {
    dto.specializations = ["haircut"];
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should validate with only isActive", async () => {
    dto.isActive = false;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should validate with only availability", async () => {
    dto.availability = {
      monday: [{ start: "09:00", end: "17:00" }],
    };
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should validate with all fields", async () => {
    dto.firstName = "John";
    dto.lastName = "Doe";
    dto.email = "john@example.com";
    dto.specializations = ["haircut"];
    dto.isActive = true;
    dto.availability = {
      monday: [{ start: "09:00", end: "17:00" }],
    };
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should validate email format when provided", async () => {
    dto.email = "invalid-email";
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("isEmail");
  });

  it("should validate specializations is an array when provided", async () => {
    dto.specializations = "not-an-array" as unknown as string[];
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("isArray");
  });

  it("should validate specializations contains only strings when provided", async () => {
    dto.specializations = [1, 2, 3] as unknown as string[];
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("isString");
  });
});
