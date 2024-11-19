import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import axios from 'axios'

vi.mock('axios')

// Mock Vite's import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:3000'
    }
  }
})

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Clear localStorage
    localStorage.clear()
    // Reset axios mocks
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useAuthStore()
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBeFalsy()
      expect(store.error).toBeNull()
      expect(store.isLoading).toBeFalsy()
    })

    it('should initialize with token from localStorage', () => {
      localStorage.setItem('admin_token', 'test-token')
      const store = useAuthStore()
      expect(store.token).toBe('test-token')
      expect(store.isAuthenticated).toBeTruthy()
    })
  })

  describe('Login', () => {
    const mockCredentials = {
      email: 'admin@test.com',
      password: 'password123'
    }

    const mockResponse = {
      data: {
        access_token: 'test-token',
        user: {
          id: 1,
          email: 'admin@test.com',
          role: 'admin'
        }
      }
    }

    it('should successfully login admin user', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse)
      
      const store = useAuthStore()
      const result = await store.login(mockCredentials)

      expect(result).toBeTruthy()
      expect(store.token).toBe('test-token')
      expect(store.user).toEqual(mockResponse.data.user)
      expect(store.isAuthenticated).toBeTruthy()
      expect(store.error).toBeNull()
      expect(localStorage.getItem('admin_token')).toBe('test-token')
    })

    it('should handle non-admin user login attempt', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: {
          access_token: 'test-token',
          user: {
            id: 1,
            email: 'user@test.com',
            role: 'user'
          }
        }
      })

      const store = useAuthStore()
      const result = await store.login(mockCredentials)

      expect(result).toBeFalsy()
      expect(store.error).toBe('Unauthorized: Admin access only')
      expect(store.isAuthenticated).toBeFalsy()
    })

    it('should handle login error', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Login failed'))

      const store = useAuthStore()
      const result = await store.login(mockCredentials)

      expect(result).toBeFalsy()
      expect(store.error).toBe('Login failed')
      expect(store.isAuthenticated).toBeFalsy()
    })
  })

  describe('Logout', () => {
    it('should clear auth state and localStorage', () => {
      const store = useAuthStore()
      
      // Setup initial authenticated state
      localStorage.setItem('admin_token', 'test-token')
      store.$patch({
        token: 'test-token',
        user: { id: 1, email: 'admin@test.com', role: 'admin' as const },
        isAuthenticated: true
      })

      store.logout()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBeFalsy()
      expect(store.error).toBeNull()
      expect(localStorage.getItem('admin_token')).toBeNull()
    })
  })

  describe('Check Auth', () => {
    const mockUser = {
      id: 1,
      email: 'admin@test.com',
      role: 'admin' as const
    }

    it('should verify valid admin token', async () => {
      localStorage.setItem('admin_token', 'test-token')
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockUser })

      const store = useAuthStore()
      const result = await store.checkAuth()

      expect(result).toBeTruthy()
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBeTruthy()
    })

    it('should handle invalid token', async () => {
      localStorage.setItem('admin_token', 'invalid-token')
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Invalid token'))

      const store = useAuthStore()
      const result = await store.checkAuth()

      expect(result).toBeFalsy()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBeFalsy()
      expect(localStorage.getItem('admin_token')).toBeNull()
    })

    it('should handle non-admin user token', async () => {
      localStorage.setItem('admin_token', 'test-token')
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: { ...mockUser, role: 'user' }
      })

      const store = useAuthStore()
      const result = await store.checkAuth()

      expect(result).toBeFalsy()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBeFalsy()
      expect(localStorage.getItem('admin_token')).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should set and clear error message', () => {
      const store = useAuthStore()
      
      store.setError('Test error')
      expect(store.error).toBe('Test error')
      
      store.clearError()
      expect(store.error).toBeNull()
    })
  })
})
