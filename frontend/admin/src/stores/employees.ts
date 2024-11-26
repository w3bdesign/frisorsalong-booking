import { defineStore } from 'pinia'
import axios, { AxiosError } from 'axios'
import { useAuthStore } from './auth'
import router from '../router'
import type { Employee } from '@/types'

interface EmployeeState {
  employees: Employee[]
  loading: boolean
  error: string | null
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
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated || !authStore.token) {
          router.push({ name: "Login" });
          return;
        }

        // Ensure the Authorization header is set
        axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/employees`)
        this.employees = response.data
      } catch (error) {
        console.error('Error details:', error);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
            router.push({ name: "Login" });
            this.error = "Økt utløpt. Vennligst logg inn igjen.";
          } else {
            this.error = error.response?.data?.message || "Kunne ikke hente ansatte";
          }
        } else {
          this.error = error instanceof Error ? error.message : "Kunne ikke hente ansatte";
        }
      } finally {
        this.loading = false
      }
    },

    async createEmployee(employeeData: Partial<Employee>) {
      this.loading = true
      this.error = null
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated || !authStore.token) {
          router.push({ name: "Login" });
          return;
        }

        // Ensure the Authorization header is set
        axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

        const response = await axios.post(`${import.meta.env.VITE_API_URL}/employees`, employeeData)
        this.employees.push(response.data)
        return response.data
      } catch (error) {
        console.error('Error details:', error);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
            router.push({ name: "Login" });
            this.error = "Økt utløpt. Vennligst logg inn igjen.";
          } else {
            this.error = error.response?.data?.message || "Kunne ikke opprette ansatt";
          }
        } else {
          this.error = error instanceof Error ? error.message : "Kunne ikke opprette ansatt";
        }
        throw error;
      } finally {
        this.loading = false
      }
    },

    async updateEmployee(id: string, employeeData: Partial<Employee>) {
      this.loading = true
      this.error = null
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated || !authStore.token) {
          router.push({ name: "Login" });
          return;
        }

        // Ensure the Authorization header is set
        axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

        const response = await axios.patch(`${import.meta.env.VITE_API_URL}/employees/${id}`, employeeData)
        const index = this.employees.findIndex(emp => emp.id === id)
        if (index !== -1) {
          this.employees[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error('Error details:', error);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
            router.push({ name: "Login" });
            this.error = "Økt utløpt. Vennligst logg inn igjen.";
          } else {
            this.error = error.response?.data?.message || "Kunne ikke oppdatere ansatt";
          }
        } else {
          this.error = error instanceof Error ? error.message : "Kunne ikke oppdatere ansatt";
        }
        throw error;
      } finally {
        this.loading = false
      }
    },

    async deleteEmployee(id: string) {
      this.loading = true
      this.error = null
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated || !authStore.token) {
          router.push({ name: "Login" });
          return;
        }

        // Ensure the Authorization header is set
        axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

        await axios.delete(`${import.meta.env.VITE_API_URL}/employees/${id}`)
        this.employees = this.employees.filter(emp => emp.id !== id)
      } catch (error) {
        console.error('Error details:', error);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
            router.push({ name: "Login" });
            this.error = "Økt utløpt. Vennligst logg inn igjen.";
          } else {
            this.error = error.response?.data?.message || "Kunne ikke slette ansatt";
          }
        } else {
          this.error = error instanceof Error ? error.message : "Kunne ikke slette ansatt";
        }
        throw error;
      } finally {
        this.loading = false
      }
    }
  }
})
