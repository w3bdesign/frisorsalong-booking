import { Role } from "./role.enum";

describe("Role Enum", () => {
  it("should have correct values for all roles", () => {
    expect(Role.USER).toBe("user");
    expect(Role.EMPLOYEE).toBe("employee");
    expect(Role.ADMIN).toBe("admin");
  });

  it("should have exactly three roles defined", () => {
    const roleValues = Object.values(Role);
    expect(roleValues).toHaveLength(3);
    expect(roleValues).toEqual(["user", "employee", "admin"]);
  });

  it("should have correct keys matching the values", () => {
    const roleEntries = Object.entries(Role);
    expect(roleEntries).toEqual([
      ["USER", "user"],
      ["EMPLOYEE", "employee"],
      ["ADMIN", "admin"],
    ]);
  });

  it("should provide type safety through TypeScript", () => {
    let role: Role;
    role = Role.USER;
    expect(role).toBe("user");

    role = Role.EMPLOYEE;
    expect(role).toBe("employee");

    role = Role.ADMIN;
    expect(role).toBe("admin");
  });
});
