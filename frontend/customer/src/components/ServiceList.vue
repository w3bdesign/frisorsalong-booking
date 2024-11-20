<template>
  <div class="max-w-4xl mx-auto">
    <h2 class="heading-1 text-gradient text-center mb-12">Velg tjeneste</h2>

    <div v-if="store.isLoading" class="grid gap-6 md:grid-cols-2">
      <div v-for="n in 4" :key="n" class="animate-pulse">
        <div class="card h-48 flex flex-col justify-between">
          <div class="space-y-4">
            <div class="h-8 bg-gray-200 rounded-lg w-2/3"></div>
            <div class="h-4 bg-gray-200 rounded-lg w-full"></div>
            <div class="h-4 bg-gray-200 rounded-lg w-3/4"></div>
          </div>
          <div class="h-10 bg-gray-200 rounded-lg w-1/3"></div>
        </div>
      </div>
    </div>

    <div
      v-else-if="store.error"
      class="card bg-red-50 border-2 border-red-100 text-red-600 text-center"
    >
      {{ store.error }}
    </div>

    <div v-else-if="store.services.length === 0" class="text-center py-8">
      <p class="text-gray-600">Ingen tjenester tilgjengelig for øyeblikket</p>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2">
      <div
        v-for="service in store.services"
        :key="service.id"
        class="group"
        @click="store.selectService(service)"
      >
        <div
          class="card hover:scale-102 hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
          :class="{
            'ring-2 ring-primary-500 bg-primary-50': store.selectedService?.id === service.id,
          }"
        >
          <div class="flex flex-col h-full">
            <div class="flex-grow">
              <h3 class="text-2xl font-bold text-gray-900 group-hover:text-primary-600 mb-3">
                {{ service.name }}
              </h3>
              <p class="text-gray-600 mb-4">{{ service.description }}</p>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <div class="flex items-center text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ service.duration }} min
              </div>
              <span class="text-xl font-bold text-gradient">
                {{
                  new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(
                    parseFloat(service.price),
                  )
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Service Bottom Sheet -->
    <div
      v-if="store.selectedService"
      class="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-8px_16px_-4px_rgb(0,0,0,0.1)] border-t transform transition-transform duration-300"
    >
      <div class="max-w-4xl mx-auto p-6">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-xl font-bold text-gray-900">{{ store.selectedService.name }}</h4>
            <div class="flex items-center space-x-3 mt-1">
              <span class="text-xl font-bold text-gradient">
                {{
                  new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(
                    parseFloat(store.selectedService.price),
                  )
                }}
              </span>
              <span class="text-gray-500">·</span>
              <span class="text-gray-600">{{ store.selectedService.duration }} min</span>
            </div>
          </div>
          <div class="flex gap-3">
            <button @click="store.clearSelection" class="btn-secondary">Avbryt</button>
            <button @click="$router.push('/booking')" class="btn-primary">Bestill nå</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useServicesStore } from '@/stores/services'

const router = useRouter()
const store = useServicesStore()

onMounted(() => {
  store.fetchServices()
})
</script>
