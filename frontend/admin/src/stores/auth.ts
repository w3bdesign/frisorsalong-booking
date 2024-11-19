import { defineStore } from 'pinia'
import axios, { AxiosError } from 'axios'

interface AuthState {
  token: string | null
  user: AdminUser | null
  isAuthenticated: boolean
  error: string | null
  isLoading: boolean
}

interface AdminUser {
  id: number
  email: string
  role: 'admin'
}

interface LoginCredentials {
  email: string
  password: string
}

interface AuthResponse {
  access_token: string
  user: AdminUser
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Handle specific error cases
    if (error.response?.status === 400) {
      return 'Invalid email or password'
    }
    if (error.response?.status === 401) {
      return 'Unauthorized access'
    }
    if (error.response?.status === 403) {
      return 'Access forbidden - Admin access only'
    }
    if (error.response?.status === 404) {
      return 'User not found'
    }
    if (error.response?.status === 500) {
      return 'Server error - Please try again later'
    }
    if (error.code === 'ECONNREFUSED') {
      return 'Unable to connect to server - Please check if the server is running'
    }
    // If we have a specific error message from the backend, use it
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    return error.message
  }
  return 'An unexpected error occurred'
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('admin_token'),
    user: null,
    isAuthenticated: !!localStorage.getItem('admin_token'),
    error: null,
    isLoading: false
  }),

  actions: {
    async login(credentials: LoginCredentials): Promise<boolean> {
      try {
        this.isLoading = true
        this.error = null

        const response = await axios.post<AuthResponse>(
          `${API_URL}/auth/login`,
          credentials
        )

        const { access_token, user } = response.data

        // Verify that the user is an admin
        if (user.role !== 'admin') {
          throw new Error('Unauthorized: Admin access only')
        }

        this.token = access_token
        this.user = user
        this.isAuthenticated = true

        // Store token in localStorage
        localStorage.setItem('admin_token', access_token)

        // Set default Authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

        return true
      } catch (error) {
        this.error = getErrorMessage(error)
        return false
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      // Clear state
      this.token = null
      this.user = null
      this.isAuthenticated = false
      this.error = null

      // Remove token from localStorage
      localStorage.removeItem('admin_token')

      // Remove Authorization header
      delete axios.defaults.headers.common['Authorization']
    },

    async checkAuth(): Promise<boolean> {
      try {
        const token = localStorage.getItem('admin_token')
        if (!token) {
          this.logout()
          return false
        }

        // Verify token with backend
        const response = await axios.get<AdminUser>(
          `${API_URL}/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        // Verify that the user is an admin
        if (response.data.role !== 'admin') {
          throw new Error('Unauthorized: Admin access only')
        }

        this.user = response.data
        this.isAuthenticated = true
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        return true
      } catch (error) {
        this.error = getErrorMessage(error)
        this.logout()
        return false
      }
    },

    clearError() {
      this.error = null
    }
  }
})
