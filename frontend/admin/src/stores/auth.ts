import { defineStore } from "pinia";
import axios from "axios";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin" | "employee";
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

const API_URL = import.meta.env.VITE_API_URL;

// Set up axios interceptor for error handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      error.message = "Ingen tilgang: Du har ikke tillatelse til å se denne ressursen";
    }
    return Promise.reject(error);
  }
);

// Initialize axios headers if token exists
const token = localStorage.getItem("admin_token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: localStorage.getItem("admin_token"),
    user: null,
    isAuthenticated: !!localStorage.getItem("admin_token"),
    error: null,
    isLoading: false,
  }),

  getters: {
    isAdmin: (state) => state.user?.role === "admin",
    isEmployee: (state) => state.user?.role === "employee",
    hasAdminAccess: (state) => state.user?.role === "admin" || state.user?.role === "employee",
  },

  actions: {
    async login(credentials: LoginCredentials): Promise<boolean> {
      try {
        this.isLoading = true;
        this.error = null;

        // Validate API_URL
        if (!API_URL) {
          throw new Error("Systemvariabler er ikke satt: Kontakt systemadministrator");
        }

        const response = await axios.post<AuthResponse>(
          `${API_URL}/auth/login`,
          credentials
        );

        const { token, user } = response.data;

        // Only allow admin and employee users to access the admin panel
        if (user.role === "user") {
          throw new Error("Ingen tilgang: Krever ansatt- eller administratortilgang");
        }

        this.token = token;
        this.user = user;
        this.isAuthenticated = true;

        // Store token in localStorage
        localStorage.setItem("admin_token", token);

        // Set default Authorization header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        return true;
      } catch (error: any) {
        console.error("Login error:", error);

        // Handle specific HTTP status codes
        if (error?.response?.status) {
          switch (error.response.status) {
            case 401:
              this.error = "Feil e-postadresse eller passord";
              break;
            case 403:
              this.error = "Ingen tilgang: Krever ansatt- eller administratortilgang";
              break;
            case 404:
              this.error = "Tjenesten er ikke tilgjengelig. Vennligst prøv igjen senere";
              break;
            case 500:
              this.error = "En serverfeil har oppstått. Vennligst prøv igjen senere";
              break;
            default:
              this.error = "En feil oppstod under innlogging. Vennligst prøv igjen";
          }
        }
        // Handle network/connection errors
        else if (error?.code === "ECONNREFUSED" || error?.code === "ERR_NETWORK") {
          this.error = "Kunne ikke koble til serveren. Sjekk internettforbindelsen din";
        }
        // Handle API_URL configuration error
        else if (error?.message?.includes("Systemvariabler er ikke satt")) {
          this.error = error.message;
        }
        // Handle other errors
        else if (error instanceof Error) {
          this.error = error.message;
        }
        // Fallback error message
        else {
          this.error = "En feil oppstod under innlogging. Vennligst prøv igjen";
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

      // If we have a token, consider the user authenticated
      // The token will be validated on API requests
      this.token = token;
      this.isAuthenticated = true;

      return true;
    },

    clearError() {
      this.error = null;
    },
  },
});
