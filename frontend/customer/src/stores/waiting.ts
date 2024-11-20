import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface QueueStatus {
  peopleWaiting: number
  estimatedWaitTime: number // in minutes
  lastUpdated: string
}

export const useWaitingStore = defineStore('waiting', () => {
  const queueStatus = ref<QueueStatus>({
    peopleWaiting: 0,
    estimatedWaitTime: 0,
    lastUpdated: new Date().toISOString(),
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const formattedWaitTime = computed(() => {
    const hours = Math.floor(queueStatus.value.estimatedWaitTime / 60)
    const minutes = queueStatus.value.estimatedWaitTime % 60

    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes}min`
  })

  const fetchQueueStatus = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('http://localhost:3000/bookings/upcoming', {
        headers: {
          accept: '*/*',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch queue status')
      }

      const data = await response.json()
      queueStatus.value = {
        peopleWaiting: data.length, // Number of upcoming bookings
        estimatedWaitTime: data.length * 30, // Rough estimate: 30 minutes per booking
        lastUpdated: new Date().toISOString(),
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch queue status'
    } finally {
      isLoading.value = false
    }
  }

  // Start polling for queue status
  const startPolling = (intervalMs: number = 60000): ReturnType<typeof setInterval> => {
    fetchQueueStatus()
    return setInterval(fetchQueueStatus, intervalMs)
  }

  return {
    queueStatus,
    isLoading,
    error,
    formattedWaitTime,
    fetchQueueStatus,
    startPolling,
  }
})
