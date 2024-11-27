import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import BookingForm from '../BookingForm.vue'
import { useServicesStore } from '../../stores/services'
import { useBookingStore } from '../../stores/booking'

// Mock vue-router
const mockRouter = {
  push: vi.fn(),
}
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

// Mock the stores
vi.mock('../../stores/services', () => ({
  useServicesStore: vi.fn(),
}))

vi.mock('../../stores/booking', () => ({
  useBookingStore: vi.fn(),
}))

vi.mock('../../stores/display', () => ({
  useDisplayStore: vi.fn(() => ({
    waitingSlots: [],
    waitingCount: 0,
    activeEmployees: [{ id: '1', name: 'Employee 1' }],
  })),
}))

describe('BookingForm', () => {
  const mockService = {
    id: '1',
    name: 'Haircut',
    duration: 30,
    price: '350',
  }

  beforeEach(() => {
    setActivePinia(createPinia())

    // Reset all mocks
    vi.clearAllMocks()
    mockRouter.push.mockClear()

    // Setup default store mocks
    vi.mocked(useServicesStore).mockReturnValue({
      selectedService: mockService,
    } as any)

    vi.mocked(useBookingStore).mockReturnValue({
      isLoading: false,
      error: ref(null),
      setPendingBooking: vi.fn(),
    } as any)
  })

  it('shows message when no service is selected', () => {
    vi.mocked(useServicesStore).mockReturnValue({
      selectedService: null,
    } as any)

    const wrapper = mount(BookingForm)
    expect(wrapper.text()).toContain('Vennligst velg en tjeneste først')
    expect(wrapper.find('button').text()).toBe('Se tjenester')
  })

  it('displays selected service details', () => {
    const wrapper = mount(BookingForm)

    expect(wrapper.text()).toContain(mockService.name)
    expect(wrapper.text()).toContain(`Varighet: ${mockService.duration} minutter`)
    // The price is formatted using Intl.NumberFormat with nb-NO locale
    const formattedPrice = new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
    }).format(parseFloat(mockService.price))
    expect(wrapper.text()).toContain(formattedPrice)
  })

  it('handles form submission correctly', async () => {
    const mockSetPendingBooking = vi.fn()
    vi.mocked(useBookingStore).mockReturnValue({
      isLoading: false,
      error: ref(null),
      setPendingBooking: mockSetPendingBooking,
    } as any)

    const wrapper = mount(BookingForm)

    // Fill in form data
    await wrapper.find('input[type="text"]').setValue('Test Customer')
    await wrapper.find('input[type="tel"]').setValue('+4712345678')

    // Submit form
    await wrapper.find('form').trigger('submit')

    expect(mockSetPendingBooking).toHaveBeenCalledWith({
      serviceId: mockService.id,
      firstName: 'Test Customer',
      phoneNumber: '+4712345678',
      startTime: expect.any(String),
    })
    expect(mockRouter.push).toHaveBeenCalledWith('/payment')
  })

  it('shows loading state during submission', async () => {
    vi.mocked(useBookingStore).mockReturnValue({
      isLoading: true,
      error: ref(null),
      setPendingBooking: vi.fn(),
    } as any)

    const wrapper = mount(BookingForm)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Behandler...')
  })

  it('disables submit button when no name is entered', () => {
    const wrapper = mount(BookingForm)
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('validates phone number format', async () => {
    const mockSetPendingBooking = vi.fn()
    vi.mocked(useBookingStore).mockReturnValue({
      isLoading: false,
      error: ref(null),
      setPendingBooking: mockSetPendingBooking,
    } as any)

    const wrapper = mount(BookingForm)

    // Fill in name first
    await wrapper.find('input[type="text"]').setValue('Test Customer')

    // Test invalid phone number
    const input = wrapper.find('input[type="tel"]')
    await input.setValue('invalid')
    await wrapper.find('form').trigger('submit')

    expect(mockSetPendingBooking).toHaveBeenCalledWith({
      serviceId: mockService.id,
      firstName: 'Test Customer',
      phoneNumber: 'invalid',
      startTime: expect.any(String),
    })
    expect(mockRouter.push).toHaveBeenCalledWith('/payment')

    // Test valid phone number
    await input.setValue('+4712345678')
    await wrapper.find('form').trigger('submit')

    expect(mockSetPendingBooking).toHaveBeenCalledWith({
      serviceId: mockService.id,
      firstName: 'Test Customer',
      phoneNumber: '+4712345678',
      startTime: expect.any(String),
    })
    expect(mockRouter.push).toHaveBeenCalledWith('/payment')
  })
})
