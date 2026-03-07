import axios, { AxiosError } from "axios";
import router from "../router";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Pre-configured axios instance for all API calls.
 * - Automatically attaches the auth token from localStorage
 * - Handles 401 responses by logging out and redirecting to login
 * - Handles 403 responses with a Norwegian error message
 */
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor: attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      delete axios.defaults.headers.common["Authorization"];
      router.push({ name: "Login" });
    }
    if (error.response?.status === 403) {
      error.message =
        "Ingen tilgang: Du har ikke tillatelse til å se denne ressursen";
    }
    return Promise.reject(error);
  }
);

export interface ApiErrorResponse {
  message?: string | string[];
}

/**
 * Extracts a user-friendly Norwegian error message from an API error.
 * Use this in store catch blocks to set `this.error` or `error.value`.
 */
export function extractErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (error instanceof AxiosError) {
    // 401 is handled globally by the interceptor
    if (error.response?.status === 401) {
      return "Økt utløpt. Vennligst logg inn igjen.";
    }
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message) {
      return Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export default api;
