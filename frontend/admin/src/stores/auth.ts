import { defineStore } from "pinia";
import axios, { AxiosError } from "axios";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
}

interface User {
  email: string;
  firstName: string;
  lastName: string;
  role: "customer" | "admin";
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

const API_URL = import.meta.env.VITE_API_URL;

// Initialize axios headers if token exists
const token = localStorage.getItem("admin_token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: token,
    user: null,
    isAuthenticated: !!token,
    error: null,
    isLoading: false,
  }),

  actions: {
    async login(credentials: LoginCredentials): Promise<boolean> {
      try {
        this.isLoading = true;
        this.error = null;

        const response = await axios.post<AuthResponse>(
          `${API_URL}/auth/login`,
          credentials
        );

        const { token, user } = response.data;

        // Only allow admin users to login
        if (user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        this.token = token;
        this.user = user;
        this.isAuthenticated = true;

        // Store token in localStorage
        localStorage.setItem("admin_token", token);

        // Set default Authorization header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        return true;
      } catch (error) {
        console.error("Login error:", error);
        if (error instanceof AxiosError) {
          this.error = error.response?.data?.message || "Invalid credentials";
        } else if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "An error occurred during login";
        }
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      // Clear state
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;

      // Remove token from localStorage
      localStorage.removeItem("admin_token");

      // Remove Authorization header
      delete axios.defaults.headers.common["Authorization"];
    },

    async checkAuth(): Promise<boolean> {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        this.logout();
        return false;
      }

      // Set the Authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      this.token = token;
      this.isAuthenticated = true;

      return true;
    },

    clearError() {
      this.error = null;
    },
  },
});
