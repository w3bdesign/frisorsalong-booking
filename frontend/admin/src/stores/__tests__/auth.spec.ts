import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../auth";
import { AxiosError } from "axios";
import api from "../../lib/api";

vi.mock("../../lib/api", () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    },
  };
});

describe("Auth Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const store = useAuthStore();
      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBeFalsy();
      expect(store.error).toBeNull();
      expect(store.isLoading).toBeFalsy();
    });

    it("should initialize with token from localStorage", () => {
      localStorage.setItem("admin_token", "test-token");
      const store = useAuthStore();
      expect(store.token).toBe("test-token");
      expect(store.isAuthenticated).toBeTruthy();
    });
  });

  describe("Login", () => {
    const mockCredentials = {
      email: "admin@test.com",
      password: "password123",
    };

    const mockAdminResponse = {
      data: {
        token: "test-token",
        user: {
          id: "1",
          email: "admin@test.com",
          role: "admin",
          firstName: "Admin",
          lastName: "User",
        },
      },
    };

    it("should successfully login admin user", async () => {
      vi.mocked(api.post).mockResolvedValueOnce(mockAdminResponse);

      const store = useAuthStore();
      const success = await store.login(mockCredentials);

      expect(success).toBeTruthy();
      expect(store.token).toBe("test-token");
      expect(store.user).toEqual(mockAdminResponse.data.user);
      expect(store.isAuthenticated).toBeTruthy();
      expect(store.error).toBeNull();
      expect(localStorage.getItem("admin_token")).toBe("test-token");
    });

    it("should reject regular user login", async () => {
      const mockUserResponse = {
        data: {
          token: "test-token",
          user: {
            id: "2",
            email: "user@test.com",
            role: "user",
            firstName: "Regular",
            lastName: "User",
          },
        },
      };
      vi.mocked(api.post).mockResolvedValueOnce(mockUserResponse);

      const store = useAuthStore();
      const success = await store.login(mockCredentials);

      expect(success).toBeFalsy();
      expect(store.error).toBe(
        "Ingen tilgang: Krever ansatt- eller administratortilgang"
      );
      expect(store.isAuthenticated).toBeFalsy();
    });

    it("should handle login error with invalid credentials", async () => {
      const mockError = new AxiosError("Unauthorized");
      mockError.response = {
        status: 401,
        statusText: "Unauthorized",
        data: { message: "Invalid credentials" },
        headers: {},
        config: {
          url: "/auth/login",
          method: "post",
        },
      } as any;

      vi.mocked(api.post).mockRejectedValueOnce(mockError);

      const store = useAuthStore();
      const success = await store.login(mockCredentials);

      expect(success).toBeFalsy();
      expect(store.error).toBe("Feil e-postadresse eller passord");
      expect(store.isAuthenticated).toBeFalsy();
      expect(localStorage.getItem("admin_token")).toBeNull();
    });

    it("should handle server connection error", async () => {
      const mockError = new AxiosError("Network Error", "ECONNREFUSED");
      mockError.code = "ECONNREFUSED";

      vi.mocked(api.post).mockRejectedValueOnce(mockError);

      const store = useAuthStore();
      const success = await store.login(mockCredentials);

      expect(success).toBeFalsy();
      expect(store.error).toBe(
        "Kunne ikke koble til serveren. Sjekk internettforbindelsen din"
      );
      expect(store.isAuthenticated).toBeFalsy();
    });
  });

  describe("Logout", () => {
    it("should clear auth state and localStorage", () => {
      const store = useAuthStore();

      // Setup initial authenticated state
      localStorage.setItem("admin_token", "test-token");
      store.$patch({
        token: "test-token",
        user: {
          id: "1",
          email: "admin@test.com",
          role: "admin",
          firstName: "Admin",
          lastName: "User",
        },
        isAuthenticated: true,
      });

      store.logout();

      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBeFalsy();
      expect(store.error).toBeNull();
      expect(localStorage.getItem("admin_token")).toBeNull();
    });
  });

  describe("Check Auth", () => {
    const mockUserProfile = {
      id: "1",
      email: "admin@test.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin" as const,
    };

    it("should fetch profile and return true when token is valid", async () => {
      localStorage.setItem("admin_token", "test-token");
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockUserProfile });

      const store = useAuthStore();
      const isValid = await store.checkAuth();

      expect(isValid).toBeTruthy();
      expect(store.token).toBe("test-token");
      expect(store.isAuthenticated).toBeTruthy();
      expect(store.user).toEqual(mockUserProfile);
      expect(api.get).toHaveBeenCalledWith("/auth/profile");
    });

    it("should not re-fetch profile if user data already exists", async () => {
      localStorage.setItem("admin_token", "test-token");

      const store = useAuthStore();
      store.$patch({ user: mockUserProfile });

      const isValid = await store.checkAuth();

      expect(isValid).toBeTruthy();
      expect(api.get).not.toHaveBeenCalled();
    });

    it("should logout when profile fetch fails (expired token)", async () => {
      localStorage.setItem("admin_token", "expired-token");
      vi.mocked(api.get).mockRejectedValueOnce(
        new AxiosError("Unauthorized", "401")
      );

      const store = useAuthStore();
      const isValid = await store.checkAuth();

      expect(isValid).toBeFalsy();
      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBeFalsy();
      expect(localStorage.getItem("admin_token")).toBeNull();
    });

    it("should return false when no token in localStorage", async () => {
      const store = useAuthStore();
      const isValid = await store.checkAuth();

      expect(isValid).toBeFalsy();
      expect(store.token).toBeNull();
      expect(store.isAuthenticated).toBeFalsy();
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should clear error message", () => {
      const store = useAuthStore();

      // Set an error
      store.$patch({ error: "Test error" });
      expect(store.error).toBe("Test error");

      // Clear error
      store.clearError();
      expect(store.error).toBeNull();
    });
  });
});
