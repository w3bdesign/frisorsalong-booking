<template>
  <div class="card bg-gradient-to-br from-white to-gray-50">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gradient mb-6">Estimert ventetid</h2>

      <div v-if="store.isLoading" class="animate-pulse space-y-4">
        <div class="h-12 bg-gray-200 rounded-lg w-32 mx-auto"></div>
        <div class="h-6 bg-gray-200 rounded-lg w-24 mx-auto"></div>
      </div>

      <template v-else>
        <div class="mb-4">
          <div class="text-5xl font-bold text-gradient mb-2">
            {{ calculateEstimatedWaitTime }}min
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
            <span class="text-lg">{{ store.waitingCount ?? 0 }} venter</span>
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
          <span>Oppdatert {{ formatTime(store.lastUpdate) }}</span>
        </div>
      </template>

      <div
        v-if="store.error"
        class="mt-4 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg p-2"
      >
        {{ store.error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useDisplayStore } from '../stores/display'

interface WaitingSlot {
  estimatedTime?: number;
}

const store = useDisplayStore()

const calculateEstimatedWaitTime = computed(() => {
  if (!store.waitingSlots.length) return 0

  // Calculate average waiting time from all slots with estimatedTime
  const slotsWithTime = store.waitingSlots.filter((slot: WaitingSlot) => slot.estimatedTime !== undefined)
  if (!slotsWithTime.length) return 0

  const totalTime = slotsWithTime.reduce((sum: number, slot: WaitingSlot) => sum + (slot.estimatedTime || 0), 0)
  return Math.round(totalTime / slotsWithTime.length)
})

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Oslo',
    hourCycle: 'h23'
  }).format(date)
}

// Start polling when component mounts
onMounted(() => {
  store.startPolling()
})

// Clean up when component unmounts
onUnmounted(() => {
  store.cleanup()
})
</script>
