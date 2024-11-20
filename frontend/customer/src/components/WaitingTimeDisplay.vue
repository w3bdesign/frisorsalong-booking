<template>
  <div class="card bg-gradient-to-br from-white to-gray-50">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gradient mb-6">Current Wait Time</h2>

      <div v-if="isLoading" class="animate-pulse space-y-4">
        <div class="h-12 bg-gray-200 rounded-lg w-32 mx-auto"></div>
        <div class="h-6 bg-gray-200 rounded-lg w-24 mx-auto"></div>
      </div>

      <template v-else>
        <div class="mb-4">
          <div class="text-5xl font-bold text-gradient mb-2">
            {{ formattedWaitTime }}
          </div>
          <div class="flex items-center justify-center space-x-2 text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
              />
            </svg>
            <span class="text-lg">{{ queueStatus.peopleWaiting }} waiting</span>
          </div>
        </div>

        <div class="text-sm text-gray-500 flex items-center justify-center space-x-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Updated {{ new Date(queueStatus.lastUpdated).toLocaleTimeString() }}</span>
        </div>
      </template>

      <div
        v-if="error"
        class="mt-4 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg p-2"
      >
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

let pollingInterval: ReturnType<typeof setInterval>

onMounted(() => {
  pollingInterval = waitingStore.startPolling(30000) // Update every 30 seconds
})

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})
</script>
