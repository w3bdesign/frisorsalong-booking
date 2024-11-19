import { defineStore } from 'pinia'
import axios from 'axios'

/// <reference types="vite/client" />

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

// Get API URL from env with type safety
const API_URL = import.meta.env.VITE_API_URL as string

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('admin_token'),
    user: null,
    isAuthenticated: !!localStorage.getItem('admin_token'),
    error: null,
    isLoading: false
  }),

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    getIsAuthenticated: (state) => state.isAuthenticated,
    getError: (state) => state.error,
    getIsLoading: (state) => state.isLoading
  },

  actions: {
    async login(credentials: LoginCredentials) {
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
        this.error = error instanceof Error ? error.message : 'Login failed'
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

    async checkAuth() {
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
        this.logout()
        return false
      }
    },

    setError(error: string | null) {
      this.error = error
    },

    clearError() {
      this.error = null
    }
  }
})
