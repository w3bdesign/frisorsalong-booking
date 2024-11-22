import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import TVDisplayView from '../TVDisplayView.vue'
import { useDisplayStore } from '@/stores/display'

vi.mock('@/stores/display', () => ({
  useDisplayStore: vi.fn(),
}))

describe('TVDisplayView', () => {
  const mockEmployees = [
    { id: '1', name: 'John', color: 'bg-blue-500', active: true },
    { id: '2', name: 'Jane', color: 'bg-green-500', active: true },
  ]

  const mockWaitingSlots = [
    {
      id: '1',
      customerName: 'Customer 1',
      estimatedTime: 30,
      assignedTo: '1',
    },
    {
      id: '2',
      customerName: 'Customer 2',
      estimatedTime: 45,
      assignedTo: null,
    },
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()

    // Mock store with default values
    vi.mocked(useDisplayStore).mockReturnValue({
      hasAvailableSlot: true,
      activeEmployees: mockEmployees,
      waitingSlots: mockWaitingSlots,
      lastUpdate: new Date('2024-01-01T12:00:00'),
      updateLastUpdate: vi.fn(),
      employees: mockEmployees,
    } as any)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('displays correct status when slots are available', () => {
    const wrapper = mount(TVDisplayView)
    expect(wrapper.find('h1').text()).toBe('Ledig')
    expect(wrapper.find('h1').classes()).toContain('text-[#c2ff00]')
  })

  it('displays correct status when no slots are available', () => {
    vi.mocked(useDisplayStore).mockReturnValue({
      hasAvailableSlot: false,
      activeEmployees: mockEmployees,
      waitingSlots: mockWaitingSlots,
      lastUpdate: new Date('2024-01-01T12:00:00'),
      updateLastUpdate: vi.fn(),
      employees: mockEmployees,
    } as any)

    const wrapper = mount(TVDisplayView)
    expect(wrapper.find('h1').text()).toBe('Opptatt')
    expect(wrapper.find('h1').classes()).toContain('text-red-500')
  })

  it('renders waiting list correctly', () => {
    const wrapper = mount(TVDisplayView)
    const waitingSlots = wrapper.findAll('.space-y-16 > div')

    expect(waitingSlots).toHaveLength(mockWaitingSlots.length)

    // Check first slot (assigned)
    const firstSlot = waitingSlots[0]
    expect(firstSlot.text()).toContain('Customer 1')
    expect(firstSlot.text()).toContain('30 min')
    expect(firstSlot.find('.w-8.h-8').classes()).toContain('bg-blue-500')

    // Check second slot (unassigned)
    const secondSlot = waitingSlots[1]
    expect(secondSlot.text()).toContain('Customer 2')
    expect(secondSlot.text()).toContain('45 min')
    expect(secondSlot.find('.w-8.h-8').classes()).toContain('bg-[#c2ff00]')
  })

  it('displays active employees correctly', () => {
    const wrapper = mount(TVDisplayView)
    const employeeElements = wrapper.findAll('[data-testid="employee"]')

    expect(employeeElements).toHaveLength(mockEmployees.length)
    expect(wrapper.text()).toContain('2 frisører på jobb')

    mockEmployees.forEach((employee, index) => {
      const element = employeeElements[index]
      expect(element.text()).toContain(employee.name)
      expect(element.find(`.${employee.color}`).exists()).toBe(true)
    })
  })

  it('formats last update time correctly', () => {
    const wrapper = mount(TVDisplayView)
    expect(wrapper.text()).toContain('12:00:00')
  })

  it('updates time automatically', async () => {
    const mockUpdateLastUpdate = vi.fn()
    vi.mocked(useDisplayStore).mockReturnValue({
      hasAvailableSlot: true,
      activeEmployees: mockEmployees,
      waitingSlots: mockWaitingSlots,
      lastUpdate: new Date('2024-01-01T12:00:00'),
      updateLastUpdate: mockUpdateLastUpdate,
      employees: mockEmployees,
    } as any)

    mount(TVDisplayView)

    // Fast forward 1 second
    await vi.advanceTimersByTime(1000)
    expect(mockUpdateLastUpdate).toHaveBeenCalled()

    // Fast forward another second
    await vi.advanceTimersByTime(1000)
    expect(mockUpdateLastUpdate).toHaveBeenCalledTimes(2)
  })

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
    const setIntervalSpy = vi.spyOn(window, 'setInterval')

    const wrapper = mount(TVDisplayView)
    expect(setIntervalSpy).toHaveBeenCalled()

    const intervalId = setIntervalSpy.mock.results[0].value
    wrapper.unmount()

    expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId)
  })
})
