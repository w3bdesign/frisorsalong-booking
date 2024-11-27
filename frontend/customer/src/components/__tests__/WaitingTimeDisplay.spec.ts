import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import WaitingTimeDisplay from '../WaitingTimeDisplay.vue'
import { useDisplayStore } from '../../stores/display'

// Mock the display store
vi.mock('../../stores/display', () => ({
  useDisplayStore: vi.fn(),
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
    // Set a fixed system time
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'))

    // Setup default mock implementation
    vi.mocked(useDisplayStore).mockReturnValue({
      waitingSlots: [
        { id: '1', customerName: 'Test', estimatedTime: 90 },
        { id: '2', customerName: 'Test2', estimatedTime: 90 },
        { id: '3', customerName: 'Test3', estimatedTime: 90 },
      ],
      waitingCount: 3,
      lastUpdate: new Date('2024-01-01T12:00:00.000Z'),
      isLoading: false,
      error: null,
      startPolling: vi.fn(() => mockTimer),
      cleanup: vi.fn(),
    } as any)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    vi.mocked(useDisplayStore).mockReturnValue({
      waitingSlots: [],
      waitingCount: 0,
      lastUpdate: new Date(),
      isLoading: true,
      error: null,
      startPolling: vi.fn(() => mockTimer),
      cleanup: vi.fn(),
    } as any)

    const wrapper = mount(WaitingTimeDisplay)
    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
  })

  it('renders waiting time and queue information correctly', () => {
    const wrapper = mount(WaitingTimeDisplay)

    // Average waiting time should be 90 minutes
    expect(wrapper.text()).toContain('90min')
    expect(wrapper.text()).toContain('3 venter')
    // Since we're using UTC time directly
    expect(wrapper.text()).toContain('13:00:00')
  })

  it('displays error message when there is an error', () => {
    const errorMessage = 'Failed to fetch queue status'
    vi.mocked(useDisplayStore).mockReturnValue({
      waitingSlots: [],
      waitingCount: 0,
      lastUpdate: new Date(),
      isLoading: false,
      error: errorMessage,
      startPolling: vi.fn(() => mockTimer),
      cleanup: vi.fn(),
    } as any)

    const wrapper = mount(WaitingTimeDisplay)
    expect(wrapper.text()).toContain(errorMessage)
    expect(wrapper.find('.text-red-600').exists()).toBe(true)
  })

  it('starts polling on mount and cleans up on unmount', async () => {
    const mockStartPolling = vi.fn(() => mockTimer)
    const mockCleanup = vi.fn()
    vi.mocked(useDisplayStore).mockReturnValue({
      waitingSlots: [{ id: '1', customerName: 'Test', estimatedTime: 90 }],
      waitingCount: 1,
      lastUpdate: new Date('2024-01-01T12:00:00.000Z'),
      isLoading: false,
      error: null,
      startPolling: mockStartPolling,
      cleanup: mockCleanup,
    } as any)

    const wrapper = mount(WaitingTimeDisplay)

    // Check that polling was started
    expect(mockStartPolling).toHaveBeenCalled()

    // Unmount and verify cleanup
    wrapper.unmount()
    expect(mockCleanup).toHaveBeenCalled()
  })

  it('formats time correctly for different locales', () => {
    const now = new Date('2024-01-01T12:34:56.000Z')
    vi.mocked(useDisplayStore).mockReturnValue({
      waitingSlots: [{ id: '1', customerName: 'Test', estimatedTime: 90 }],
      waitingCount: 1,
      lastUpdate: now,
      isLoading: false,
      error: null,
      startPolling: vi.fn(() => mockTimer),
      cleanup: vi.fn(),
    } as any)

    const wrapper = mount(WaitingTimeDisplay)
    // Since we're using UTC time directly
    expect(wrapper.text()).toContain('13:34:56')
  })
})
