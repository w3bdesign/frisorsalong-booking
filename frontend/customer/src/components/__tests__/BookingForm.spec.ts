import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import BookingForm from '../BookingForm.vue'
import { useServicesStore } from '@/stores/services'
import { useBookingStore } from '@/stores/booking'
import { useRouter } from 'vue-router'

// Mock vue-router
const mockRouter = {
  push: vi.fn(),
}
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

// Mock the stores
vi.mock('@/stores/services', () => ({
  useServicesStore: vi.fn(),
}))

vi.mock('@/stores/booking', () => ({
  useBookingStore: vi.fn(),
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
      createBooking: vi.fn().mockResolvedValue(undefined),
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

  it('allows selecting time slots', async () => {
    const wrapper = mount(BookingForm)

    // Select "Now" time slot
    const timeSlotButton = wrapper.find('button[type="button"]')
    await timeSlotButton.trigger('click')

    // Check if the correct class is applied
    expect(timeSlotButton.classes()).toContain('border-primary-500')
  })

  it('handles form submission correctly', async () => {
    const mockCreateBooking = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useBookingStore).mockReturnValue({
      isLoading: false,
      error: ref(null),
      createBooking: mockCreateBooking,
    } as any)

    const wrapper = mount(BookingForm)

    // Fill in form data
    await wrapper.find('button[type="button"]').trigger('click') // Select time slot
    await wrapper.find('input[type="tel"]').setValue('+4712345678')

    // Submit form
    await wrapper.find('form').trigger('submit')

    expect(mockCreateBooking).toHaveBeenCalledWith({
      serviceId: mockService.id,
      time: 'now',
      phoneNumber: '+4712345678',
    })
    expect(mockRouter.push).toHaveBeenCalledWith('/payment')
  })

  it('shows loading state during submission', async () => {
    vi.mocked(useBookingStore).mockReturnValue({
      isLoading: true,
      error: ref(null),
      createBooking: vi.fn().mockResolvedValue(undefined),
    } as any)

    const wrapper = mount(BookingForm)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Behandler...')
  })

  it('displays error message when submission fails', async () => {
    const mockCreateBooking = vi.fn().mockRejectedValue(new Error('Failed to create booking'))
    const error = ref<string | null>(null)
    vi.mocked(useBookingStore).mockReturnValue({
      isLoading: false,
      error,
      createBooking: mockCreateBooking,
    } as any)

    const wrapper = mount(BookingForm)

    // Fill in form data
    await wrapper.find('button[type="button"]').trigger('click') // Select time slot
    await wrapper.find('input[type="tel"]').setValue('+4712345678')

    // Submit form and update store error state
    await wrapper.find('form').trigger('submit')
    error.value = 'Failed to create booking'
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.text-red-600').exists()).toBe(true)
    expect(wrapper.find('.text-red-600').text()).toBe('Failed to create booking')
  })

  it('disables submit button when no time slot is selected', () => {
    const wrapper = mount(BookingForm)
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('validates phone number format', async () => {
    const mockCreateBooking = vi.fn()
    const error = ref<string | null>(null)
    vi.mocked(useBookingStore).mockReturnValue({
      isLoading: false,
      error,
      createBooking: mockCreateBooking,
    } as any)

    const wrapper = mount(BookingForm)

    // Select time slot first
    await wrapper.find('button[type="button"]').trigger('click')

    // Test invalid phone number
    mockCreateBooking.mockRejectedValueOnce(new Error('Invalid phone number'))
    const input = wrapper.find('input[type="tel"]')
    await input.setValue('invalid')
    await wrapper.find('form').trigger('submit')
    error.value = 'Invalid phone number'
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.text-red-600').exists()).toBe(true)
    expect(wrapper.find('.text-red-600').text()).toBe('Invalid phone number')

    // Test valid phone number
    mockCreateBooking.mockResolvedValueOnce(undefined)
    error.value = null
    await input.setValue('+4712345678')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.text-red-600').exists()).toBe(false)
  })
})
