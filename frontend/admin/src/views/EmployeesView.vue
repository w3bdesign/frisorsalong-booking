<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Ansatte</h1>
      <Button
        @click="showAddModal = true"
        variant="primary"
      >
        Legg til ansatt
      </Button>
    </div>

    <!-- Toast Notification -->
    <div 
      v-if="showToast" 
      class="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 flex items-center shadow-lg"
    >
      <div class="mr-2">✓</div>
      <p>{{ toastMessage }}</p>
    </div>

    <!-- Loading and Error States -->
    <div v-if="employeesStore.loading" class="text-center py-4">
      Laster ansatte...
    </div>
    <div v-else-if="employeesStore.error" class="text-red-500 py-4">
      {{ employeesStore.error }}
    </div>

    <!-- Employees Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Navn</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-post</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spesialiseringer</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handlinger</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="employee in employeesStore.employees" :key="employee.id">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ employee.user.firstName }} {{ employee.user.lastName }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ employee.user.email }}
            </td>
            <td class="px-6 py-4">
              <span 
                v-for="spec in employee.specializations" 
                :key="spec"
                class="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
              >
                {{ spec }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ employee.isActive ? 'Aktiv' : 'Inaktiv' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <Button
                @click="editEmployee(employee)"
                variant="secondary"
                size="sm"
              >
                Rediger
              </Button>
              <Button
                @click="resetEmployeePassword(employee)"
                variant="secondary"
                size="sm"
              >
                Tilbakestill passord
              </Button>
              <Button
                @click="confirmDelete(employee)"
                variant="danger"
                size="sm"
              >
                Slett
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Employee Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">
          {{ showEditModal ? 'Rediger ansatt' : 'Legg til ny ansatt' }}
        </h2>
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Fornavn</label>
              <input
                v-model="employeeForm.firstName"
                type="text"
                required
                :disabled="isSubmitting"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Etternavn</label>
              <input
                v-model="employeeForm.lastName"
                type="text"
                required
                :disabled="isSubmitting"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">E-post</label>
              <input
                v-model="employeeForm.email"
                type="email"
                required
                :disabled="isSubmitting"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Spesialiseringer</label>
              <input
                v-model="specializationsInput"
                type="text"
                :disabled="isSubmitting"
                placeholder="Skriv inn spesialiseringer adskilt med komma"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select
                v-model="employeeForm.isActive"
                :disabled="isSubmitting"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option :value="true">Aktiv</option>
                <option :value="false">Inaktiv</option>
              </select>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              @click="closeModal"
              :disabled="isSubmitting"
              variant="secondary"
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              :disabled="isSubmitting"
              :loading="isSubmitting"
              variant="primary"
            >
              {{ showEditModal ? 'Oppdater' : 'Legg til' }}
            </Button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Bekreft sletting</h2>
        <p>Er du sikker på at du vil slette denne ansatte?</p>
        <div class="mt-6 flex justify-end space-x-3">
          <Button
            @click="showDeleteModal = false"
            variant="secondary"
          >
            Avbryt
          </Button>
          <Button
            @click="deleteSelectedEmployee"
            variant="danger"
          >
            Slett
          </Button>
        </div>
      </div>
    </div>

    <!-- Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <div class="flex items-center mb-4">
          <div class="bg-green-100 rounded-full p-2 mr-3">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-xl font-bold">{{ isPasswordReset ? 'Nytt passord generert' : 'Ansatt opprettet' }}</h2>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          <p class="text-yellow-800 mb-2">
            {{ isPasswordReset 
              ? 'Dette er det nye midlertidige passordet for den ansatte.'
              : 'Dette er det midlertidige passordet for den nye ansatte.' 
            }}
            Vennligst del dette med den ansatte på en sikker måte.
            Passordet vil kun vises denne ene gangen.
          </p>
          <div class="relative">
            <div class="bg-white p-3 rounded border border-yellow-300 font-mono text-lg text-center select-all">
              {{ temporaryPassword }}
            </div>
            <Button
              @click="copyPassword"
              variant="secondary"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              title="Kopier passord"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </Button>
          </div>
          <p v-if="showCopiedMessage" class="text-green-600 text-sm mt-2 text-center">
            Passord kopiert!
          </p>
        </div>

        <div class="mt-6 flex justify-end">
          <Button
            @click="closePasswordModal"
            variant="primary"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEmployeesStore } from '../stores/employees'
import type { Employee } from '../types'
import Button from '../components/base/Button.vue'

const employeesStore = useEmployeesStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showPasswordModal = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const selectedEmployee = ref<Employee | null>(null)
const specializationsInput = ref('')
const temporaryPassword = ref('')
const isSubmitting = ref(false)
const isPasswordReset = ref(false)
const showCopiedMessage = ref(false)

const employeeForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  isActive: true,
  specializations: [] as string[]
})

onMounted(async () => {
  await employeesStore.fetchEmployees()
})

const showToastMessage = (message: string) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const editEmployee = (employee: Employee) => {
  selectedEmployee.value = employee
  employeeForm.value = {
    firstName: employee.user.firstName,
    lastName: employee.user.lastName,
    email: employee.user.email,
    isActive: employee.isActive,
    specializations: [...employee.specializations]
  }
  specializationsInput.value = employee.specializations.join(', ')
  showEditModal.value = true
}

const resetEmployeePassword = async (employee: Employee) => {
  try {
    const result = await employeesStore.resetPassword(employee.id)
    temporaryPassword.value = result.temporaryPassword
    isPasswordReset.value = true
    showPasswordModal.value = true
  } catch (error) {
    if (error instanceof Error) {
      showToastMessage(error.message)
    } else {
      showToastMessage('Kunne ikke tilbakestille passord')
    }
  }
}

const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(temporaryPassword.value)
    showCopiedMessage.value = true
    setTimeout(() => {
      showCopiedMessage.value = false
    }, 2000)
  } catch (err) {
    showToastMessage('Kunne ikke kopiere passord')
  }
}

const confirmDelete = (employee: Employee) => {
  selectedEmployee.value = employee
  showDeleteModal.value = true
}

const deleteSelectedEmployee = async () => {
  if (selectedEmployee.value) {
    await employeesStore.deleteEmployee(selectedEmployee.value.id)
    showDeleteModal.value = false
    selectedEmployee.value = null
    showToastMessage('Ansatt slettet')
  }
}

const closeModal = () => {
  if (!isSubmitting.value) {
    showAddModal.value = false
    showEditModal.value = false
    selectedEmployee.value = null
    employeeForm.value = {
      firstName: '',
      lastName: '',
      email: '',
      isActive: true,
      specializations: []
    }
    specializationsInput.value = ''
  }
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  temporaryPassword.value = ''
  isPasswordReset.value = false
  showToastMessage(isPasswordReset.value ? 'Passord tilbakestilt' : 'Ansatt opprettet')
}

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  
  isSubmitting.value = true
  
  try {
    const employeeData = {
      ...employeeForm.value,
      specializations: specializationsInput.value.split(',').map(s => s.trim()).filter(Boolean)
    }

    if (showEditModal.value && selectedEmployee.value) {
      await employeesStore.updateEmployee(selectedEmployee.value.id, employeeData)
      showEditModal.value = false
      showToastMessage('Ansatt oppdatert')
    } else {
      const result = await employeesStore.createEmployee(employeeData)
      if (result.temporaryPassword) {
        temporaryPassword.value = result.temporaryPassword
        isPasswordReset.value = false
        showPasswordModal.value = true
      }
    }
  } catch (error) {
    console.error('Kunne ikke lagre ansatt:', error)
    if (error instanceof Error) {
      showToastMessage(error.message)
    } else {
      showToastMessage('Kunne ikke lagre ansatt')
    }
  } finally {
    isSubmitting.value = false
    if (!showEditModal.value) {
      showAddModal.value = false
    }
  }
}
</script>
