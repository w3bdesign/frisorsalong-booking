import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import PaymentForm from '../PaymentForm.vue'
import { useBookingStore } from '@/stores/booking'
import { useServicesStore } from '@/stores/services'
import { useRouter } from 'vue-router'

// Mock vue-router
const mockRouter = {
  push: vi.fn(),
}
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

// Mock the stores
vi.mock('@/stores/booking', () => ({
  useBookingStore: vi.fn(),
}))

vi.mock('@/stores/services', () => ({
  useServicesStore: vi.fn(),
}))

describe('PaymentForm', () => {
  const mockBooking = {
    id: '1',
    time: 'now',
    serviceId: '1',
    phoneNumber: '+4712345678',
  }

  const mockService = {
    id: '1',
    name: 'Haircut',
    duration: 30,
    price: '350',
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockRouter.push.mockClear()

    // Setup default store mocks
    vi.mocked(useBookingStore).mockReturnValue({
      currentBooking: mockBooking,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useServicesStore).mockReturnValue({
      selectedService: mockService,
    } as any)

    // Reset timers
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const mountComponent = () => {
    return mount(PaymentForm, {
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    })
  }

  it('shows message when no booking is found', () => {
    vi.mocked(useBookingStore).mockReturnValue({
      currentBooking: null,
      isLoading: false,
      error: null,
    } as any)

    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Ingen aktiv bestilling funnet')
    expect(wrapper.find('button').text()).toBe('Tilbake til tjenester')
  })

  it('displays payment amount correctly', () => {
    const wrapper = mountComponent()
    // Price should be formatted using Intl.NumberFormat with nb-NO locale
    const formattedPrice = new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
    }).format(parseFloat(mockService.price))
    expect(wrapper.text()).toContain(formattedPrice)
  })

  it('shows loading state during payment processing', async () => {
    vi.mocked(useBookingStore).mockReturnValue({
      currentBooking: mockBooking,
      isLoading: true,
      error: null,
    } as any)

    const wrapper = mountComponent()
    const payButton = wrapper.find('button.btn-primary')
    expect(payButton.attributes('disabled')).toBeDefined()
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
    expect(wrapper.text()).toContain('Behandler...')
  })

  it('shows success message after payment', async () => {
    const wrapper = mountComponent()

    // Trigger payment
    await wrapper.find('button.btn-primary').trigger('click')

    // Fast-forward through the payment delay
    await vi.advanceTimersByTime(1500)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Betaling vellykket!')
    expect(wrapper.text()).toContain(mockBooking.time)
  })

  it('displays error message when payment fails', () => {
    vi.mocked(useBookingStore).mockReturnValue({
      currentBooking: mockBooking,
      isLoading: false,
      error: 'Payment failed',
    } as any)

    const wrapper = mountComponent()
    expect(wrapper.find('.text-red-600').text()).toBe('Payment failed')
  })

  it('navigates back to home after successful payment', async () => {
    const wrapper = mountComponent()

    // Complete payment
    await wrapper.find('button.btn-primary').trigger('click')
    await vi.advanceTimersByTime(1500)
    await wrapper.vm.$nextTick()

    // Click return button
    const homeButton = wrapper.find('button.btn-secondary')
    await homeButton.trigger('click')
    expect(mockRouter.push).toHaveBeenCalledWith('/')
  })

  it('handles missing service price gracefully', () => {
    vi.mocked(useServicesStore).mockReturnValue({
      selectedService: null,
    } as any)

    const wrapper = mountComponent()
    const formattedPrice = new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
    }).format(0)
    expect(wrapper.text()).toContain(formattedPrice)
  })

  it('shows payment button in correct states', async () => {
    const wrapper = mountComponent()

    // Initial state
    expect(wrapper.find('button.btn-primary').text()).toBe('Trykk for å betale')

    // During payment
    await wrapper.find('button.btn-primary').trigger('click')
    await wrapper.vm.$nextTick()

    // After payment
    await vi.advanceTimersByTime(1500)
    await wrapper.vm.$nextTick()

    // Success state
    expect(wrapper.find('button.btn-primary').exists()).toBe(false)
    expect(wrapper.find('button.btn-secondary').text()).toBe('Tilbake til forsiden')
  })

  it('shows payment instructions', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Trykk på knappen for å simulere kortbetaling')
  })
})