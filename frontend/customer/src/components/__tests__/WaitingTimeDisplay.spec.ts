import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import WaitingTimeDisplay from '../WaitingTimeDisplay.vue'
import { useWaitingStore } from '@/stores/waiting'

// Mock the waiting store
vi.mock('@/stores/waiting', () => ({
  useWaitingStore: vi.fn(),
}))

describe('WaitingTimeDisplay', () => {
  // Create a mock timer for setInterval
  const mockTimer = {
    hasRef: () => true,
    refresh: () => mockTimer,
    [Symbol.toPrimitive]: () => 123,
  } as unknown as ReturnType<typeof setInterval>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    // Set a fixed system time to avoid timezone issues
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'))

    // Setup default mock implementation
    vi.mocked(useWaitingStore).mockReturnValue({
      queueStatus: {
        peopleWaiting: 3,
        estimatedWaitTime: 90,
        lastUpdated: '2024-01-01T12:00:00.000Z',
      },
      isLoading: false,
      error: null,
      formattedWaitTime: '1h 30min',
      startPolling: vi.fn(() => mockTimer),
    } as any)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    vi.mocked(useWaitingStore).mockReturnValue({
      queueStatus: {
        peopleWaiting: 0,
        estimatedWaitTime: 0,
        lastUpdated: new Date().toISOString(),
      },
      isLoading: true,
      error: null,
      formattedWaitTime: '0min',
      startPolling: vi.fn(() => mockTimer),
    } as any)

    const wrapper = mount(WaitingTimeDisplay)
    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
  })

  it('renders waiting time and queue information correctly', () => {
    const wrapper = mount(WaitingTimeDisplay)

    expect(wrapper.text()).toContain('1h 30min')
    expect(wrapper.text()).toContain('3 venter')
    // Since we're using nb-NO locale and the time is fixed at 12:00:00 UTC
    expect(wrapper.text()).toContain('13:00:00') // UTC+1 for Norway
  })

  it('displays error message when there is an error', () => {
    const errorMessage = 'Failed to fetch queue status'
    vi.mocked(useWaitingStore).mockReturnValue({
      queueStatus: {
        peopleWaiting: 0,
        estimatedWaitTime: 0,
        lastUpdated: new Date().toISOString(),
      },
      isLoading: false,
      error: errorMessage,
      formattedWaitTime: '0min',
      startPolling: vi.fn(() => mockTimer),
    } as any)

    const wrapper = mount(WaitingTimeDisplay)
    expect(wrapper.text()).toContain(errorMessage)
    expect(wrapper.find('.text-red-600').exists()).toBe(true)
  })

  it('starts polling on mount and cleans up on unmount', async () => {
    const mockStartPolling = vi.fn(() => mockTimer)
    vi.mocked(useWaitingStore).mockReturnValue({
      queueStatus: {
        peopleWaiting: 3,
        estimatedWaitTime: 90,
        lastUpdated: '2024-01-01T12:00:00.000Z',
      },
      isLoading: false,
      error: null,
      formattedWaitTime: '1h 30min',
      startPolling: mockStartPolling,
    } as any)

    const wrapper = mount(WaitingTimeDisplay)

    // Check that polling was started with correct interval
    expect(mockStartPolling).toHaveBeenCalledWith(30000)

    // Unmount and verify cleanup
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0) // All timers should be cleared
  })

  it('formats time correctly for different locales', () => {
    const now = new Date('2024-01-01T12:34:56.000Z')
    vi.mocked(useWaitingStore).mockReturnValue({
      queueStatus: {
        peopleWaiting: 3,
        estimatedWaitTime: 90,
        lastUpdated: now.toISOString(),
      },
      isLoading: false,
      error: null,
      formattedWaitTime: '1h 30min',
      startPolling: vi.fn(() => mockTimer),
    } as any)

    const wrapper = mount(WaitingTimeDisplay)
    // Since we're using nb-NO locale and the time is at 12:34:56 UTC
    expect(wrapper.text()).toContain('13:34:56') // UTC+1 for Norway
  })
})
