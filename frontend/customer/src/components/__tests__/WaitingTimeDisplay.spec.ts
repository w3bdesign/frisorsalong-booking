import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import WaitingTimeDisplay from '../WaitingTimeDisplay.vue'
import { useWaitingStore } from '@/stores/waiting'
import type { Store } from 'pinia'

// Create a mock timer for setInterval
const mockTimer = {
  hasRef: () => true,
  refresh: () => mockTimer,
  [Symbol.toPrimitive]: () => 123,
} as unknown as ReturnType<typeof setInterval>

// Create a function to generate a mock store with all required Pinia properties
function createMockStore(overrides = {}) {
  const defaultStore = {
    queueStatus: {
      peopleWaiting: 3,
      estimatedWaitTime: 90,
      lastUpdated: '2024-01-01T12:00:00.000Z',
    },
    isLoading: false,
    error: null,
    formattedWaitTime: '1h 30min',
    startPolling: vi.fn(() => mockTimer),
    // Required Pinia store properties
    $id: 'waiting',
    $state: {},
    $patch: vi.fn(),
    $reset: vi.fn(),
    $subscribe: vi.fn(),
    $dispose: vi.fn(),
    $onAction: vi.fn(),
    $unsubscribe: vi.fn(),
  }

  return {
    ...defaultStore,
    ...overrides,
  } as unknown as Store
}

// Mock the waiting store
vi.mock('@/stores/waiting', () => ({
  useWaitingStore: vi.fn(() => createMockStore()),
}))

describe('WaitingTimeDisplay', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    // Set a fixed system time to avoid timezone issues
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'))
    // Reset the mock implementation before each test
    vi.mocked(useWaitingStore).mockImplementation(() => createMockStore())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders loading state correctly', () => {
    vi.mocked(useWaitingStore).mockImplementation(() =>
      createMockStore({
        queueStatus: {
          peopleWaiting: 0,
          estimatedWaitTime: 0,
          lastUpdated: new Date().toISOString(),
        },
        isLoading: true,
        formattedWaitTime: '0min',
      }),
    )

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
    vi.mocked(useWaitingStore).mockImplementation(() =>
      createMockStore({
        queueStatus: {
          peopleWaiting: 0,
          estimatedWaitTime: 0,
          lastUpdated: new Date().toISOString(),
        },
        error: errorMessage,
        formattedWaitTime: '0min',
      }),
    )

    const wrapper = mount(WaitingTimeDisplay)
    expect(wrapper.text()).toContain(errorMessage)
    expect(wrapper.find('.text-red-600').exists()).toBe(true)
  })

  it('starts polling on mount and cleans up on unmount', async () => {
    const mockStartPolling = vi.fn(() => mockTimer)
    vi.mocked(useWaitingStore).mockImplementation(() =>
      createMockStore({
        startPolling: mockStartPolling,
      }),
    )

    const wrapper = mount(WaitingTimeDisplay)

    // Check that polling was started with correct interval
    expect(mockStartPolling).toHaveBeenCalledWith(30000)

    // Unmount and verify cleanup
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0) // All timers should be cleared
  })

  it('formats time correctly for different locales', () => {
    const now = new Date('2024-01-01T12:34:56.000Z')
    vi.mocked(useWaitingStore).mockImplementation(() =>
      createMockStore({
        queueStatus: {
          peopleWaiting: 3,
          estimatedWaitTime: 90,
          lastUpdated: now.toISOString(),
        },
      }),
    )

    const wrapper = mount(WaitingTimeDisplay)
    // Since we're using nb-NO locale and the time is at 12:34:56 UTC
    expect(wrapper.text()).toContain('13:34:56') // UTC+1 for Norway
  })
})
