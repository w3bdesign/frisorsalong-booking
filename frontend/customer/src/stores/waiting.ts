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
      const response = await fetch('/bookings/upcoming/count', {
        headers: {
          accept: '*/*',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch queue status')
      }

      const count = await response.json()
      queueStatus.value = {
        peopleWaiting: count,
        estimatedWaitTime: count * 30,
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
    void fetchQueueStatus()
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
