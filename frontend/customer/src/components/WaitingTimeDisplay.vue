<template>
  <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
    <div class="text-center">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Current Wait Time</h2>

      <div v-if="isLoading" class="animate-pulse">
        <div class="h-8 bg-gray-200 rounded w-24 mx-auto mb-4"></div>
        <div class="h-6 bg-gray-200 rounded w-32 mx-auto"></div>
      </div>

      <template v-else>
        <div class="text-4xl font-bold text-primary-600 mb-2">
          {{ formattedWaitTime }}
        </div>
        <p class="text-gray-600">{{ queueStatus.peopleWaiting }} people waiting</p>
        <p class="text-sm text-gray-500 mt-4">
          Last updated: {{ new Date(queueStatus.lastUpdated).toLocaleTimeString() }}
        </p>
      </template>

      <div v-if="error" class="mt-4 text-red-600 text-sm">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useWaitingStore } from '@/stores/waiting'

const waitingStore = useWaitingStore()
const { queueStatus, isLoading, error, formattedWaitTime } = waitingStore

let pollingInterval: number | undefined

onMounted(() => {
  pollingInterval = waitingStore.startPolling(30000) // Update every 30 seconds
})

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})
</script>
