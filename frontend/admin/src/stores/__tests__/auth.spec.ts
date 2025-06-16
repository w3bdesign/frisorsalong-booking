import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../auth";
import axios, { AxiosError } from "axios";

vi.mock("axios");

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
      vi.mocked(axios.post).mockResolvedValueOnce(mockAdminResponse);

      const store = useAuthStore();
      const success = await store.login(mockCredentials);

      expect(success).toBeTruthy();
      expect(store.token).toBe("test-token");
      expect(store.user).toEqual(mockAdminResponse.data.user);
      expect(store.isAuthenticated).toBeTruthy();
      expect(store.error).toBeNull();
      expect(localStorage.getItem("admin_token")).toBe("test-token");
      expect(axios.defaults.headers.common["Authorization"]).toBe(
        "Bearer test-token"
      );
    });

    it("should handle login error with invalid credentials", async () => {
      const mockError = new AxiosError("Unauthorized");
      mockError.response = {
        status: 401,
        statusText: "Unauthorized",
        data: { message: "Invalid credentials" },
        headers: {},
        config: {
          method: "post",
          url: "/auth/login",
          headers: {}
        }
      };

      vi.mocked(axios.post).mockRejectedValueOnce(mockError);

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

      vi.mocked(axios.post).mockRejectedValueOnce(mockError);

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
      expect(axios.defaults.headers.common["Authorization"]).toBeUndefined();
    });
  });

  describe("Check Auth", () => {
    it("should handle valid token", async () => {
      localStorage.setItem("admin_token", "test-token");

      const store = useAuthStore();
      const isValid = await store.checkAuth();

      expect(isValid).toBeTruthy();
      expect(store.token).toBe("test-token");
      expect(store.isAuthenticated).toBeTruthy();
      expect(axios.defaults.headers.common["Authorization"]).toBe(
        "Bearer test-token"
      );
    });

    it("should handle invalid token", async () => {
      // Don't set token in localStorage
      const store = useAuthStore();
      const isValid = await store.checkAuth();

      expect(isValid).toBeFalsy();
      expect(store.token).toBeNull();
      expect(store.isAuthenticated).toBeFalsy();
      expect(localStorage.getItem("admin_token")).toBeNull();
    });

    it("should handle missing token", async () => {
      const store = useAuthStore();
      const isValid = await store.checkAuth();

      expect(isValid).toBeFalsy();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBeFalsy();
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
