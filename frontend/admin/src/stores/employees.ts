import { defineStore } from 'pinia'
import api, { extractErrorMessage } from '../lib/api'
import type { Employee } from '../types'

interface EmployeeState {
  employees: Employee[]
  loading: boolean
  error: string | null
}

interface CreateEmployeeResponse {
  employee: Employee;
  temporaryPassword: string;
}

interface ResetPasswordResponse {
  temporaryPassword: string;
}

export const useEmployeesStore = defineStore('employees', {
  state: (): EmployeeState => ({
    employees: [],
    loading: false,
    error: null
  }),

  getters: {
    getActiveEmployees: (state) => state.employees.filter(emp => emp.isActive),
    getEmployeeById: (state) => (id: string) => 
      state.employees.find(emp => emp.id === id)
  },

  actions: {
    async fetchEmployees() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get<Employee[]>('/employees')
        this.employees = response.data
      } catch (error) {
        this.error = extractErrorMessage(error, "Kunne ikke hente ansatte")
      } finally {
        this.loading = false
      }
    },

    async createEmployee(employeeData: Partial<Employee>): Promise<CreateEmployeeResponse> {
      this.loading = true
      this.error = null
      try {
        const response = await api.post<CreateEmployeeResponse>('/employees', employeeData)
        
        if (response.data.employee) {
          this.employees.push(response.data.employee)
        }
        
        return response.data
      } catch (error) {
        this.error = extractErrorMessage(error, "Kunne ikke opprette ansatt")
        throw error
      } finally {
        this.loading = false
      }
    },

    async resetPassword(id: string): Promise<ResetPasswordResponse> {
      this.loading = true
      this.error = null
      try {
        const response = await api.post<ResetPasswordResponse>(
          `/employees/${id}/reset-password`
        )
        return response.data
      } catch (error) {
        this.error = extractErrorMessage(error, "Kunne ikke tilbakestille passord")
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateEmployee(id: string, employeeData: Partial<Employee>) {
      this.loading = true
      this.error = null
      try {
        const response = await api.patch(`/employees/${id}`, employeeData)
        const index = this.employees.findIndex(emp => emp.id === id)
        if (index !== -1) {
          this.employees[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = extractErrorMessage(error, "Kunne ikke oppdatere ansatt")
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteEmployee(id: string) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/employees/${id}`)
        this.employees = this.employees.filter(emp => emp.id !== id)
      } catch (error) {
        this.error = extractErrorMessage(error, "Kunne ikke slette ansatt")
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
