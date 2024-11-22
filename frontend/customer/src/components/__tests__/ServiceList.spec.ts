import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useServicesStore } from '@/stores/services'
import ServiceList from '../ServiceList.vue'
import { createRouter, createWebHistory } from 'vue-router'

// Create router instance for testing
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/booking',
      name: 'booking',
      component: { template: '<div>Booking</div>' },
    },
  ],
})

// Mock service data
const mockServices = [
  {
    id: '1',
    name: 'Haircut',
    description: 'Basic haircut',
    duration: 30,
    price: '300',
    isActive: true,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  },
]

describe('ServiceList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should show loading skeleton', () => {
      const wrapper = mount(ServiceList, {
        global: {
          plugins: [
            createTestingPinia({
              createSpy: vi.fn,
              initialState: {
                services: {
                  isLoading: true,
                  services: [],
                  error: null,
                },
              },
            }),
            router,
          ],
        },
      })

      expect(wrapper.find('.animate-pulse').exists()).toBe(true)
      expect(wrapper.findAll('.animate-pulse')).toHaveLength(4)
    })
  })

  describe('Error State', () => {
    it('should show error message', () => {
      const errorMessage = 'Failed to fetch services'
      const wrapper = mount(ServiceList, {
        global: {
          plugins: [
            createTestingPinia({
              createSpy: vi.fn,
              initialState: {
                services: {
                  isLoading: false,
                  services: [],
                  error: errorMessage,
                },
              },
            }),
            router,
          ],
        },
      })

      expect(wrapper.text()).toContain(errorMessage)
      expect(wrapper.find('.bg-red-50').exists()).toBe(true)
    })
  })

  describe('Empty State', () => {
    it('should show empty message when no services', () => {
      const wrapper = mount(ServiceList, {
        global: {
          plugins: [
            createTestingPinia({
              createSpy: vi.fn,
              initialState: {
                services: {
                  isLoading: false,
                  services: [],
                  error: null,
                },
              },
            }),
            router,
          ],
        },
      })

      expect(wrapper.text()).toContain('Ingen tjenester tilgjengelig for øyeblikket')
    })
  })

  describe('Services Display', () => {
    it('should display services correctly', () => {
      const wrapper = mount(ServiceList, {
        global: {
          plugins: [
            createTestingPinia({
              createSpy: vi.fn,
              initialState: {
                services: {
                  isLoading: false,
                  services: mockServices,
                  error: null,
                },
              },
            }),
            router,
          ],
        },
      })

      expect(wrapper.text()).toContain(mockServices[0].name)
      expect(wrapper.text()).toContain(mockServices[0].description)
      expect(wrapper.text()).toContain(`${mockServices[0].duration} min`)
      // Check for price in Norwegian format (kr 300,00)
      const formattedPrice = new Intl.NumberFormat('nb-NO', {
        style: 'currency',
        currency: 'NOK',
      }).format(parseFloat(mockServices[0].price))
      expect(wrapper.text()).toContain(formattedPrice)
    })

    it('should select service on click', async () => {
      const wrapper = mount(ServiceList, {
        global: {
          plugins: [
            createTestingPinia({
              createSpy: vi.fn,
              initialState: {
                services: {
                  isLoading: false,
                  services: mockServices,
                  error: null,
                },
              },
            }),
            router,
          ],
        },
      })

      const store = useServicesStore()
      await wrapper.find('.group').trigger('click')

      expect(store.selectService).toHaveBeenCalledWith(mockServices[0])
    })
  })

  describe('Selected Service Actions', () => {
    it('should show bottom sheet when service is selected', () => {
      const wrapper = mount(ServiceList, {
        global: {
          plugins: [
            createTestingPinia({
              createSpy: vi.fn,
              initialState: {
                services: {
                  isLoading: false,
                  services: mockServices,
                  error: null,
                  selectedService: mockServices[0],
                },
              },
            }),
            router,
          ],
        },
      })

      expect(wrapper.find('.fixed.bottom-0').exists()).toBe(true)
      expect(wrapper.text()).toContain('Bestill nå')
      expect(wrapper.text()).toContain('Avbryt')
    })

    it('should clear selection when cancel is clicked', async () => {
      const wrapper = mount(ServiceList, {
        global: {
          plugins: [
            createTestingPinia({
              createSpy: vi.fn,
              initialState: {
                services: {
                  isLoading: false,
                  services: mockServices,
                  error: null,
                  selectedService: mockServices[0],
                },
              },
            }),
            router,
          ],
        },
      })

      const store = useServicesStore()
      await wrapper.find('.btn-secondary').trigger('click')

      expect(store.clearSelection).toHaveBeenCalled()
    })

    it('should navigate to booking when book button is clicked', async () => {
      const wrapper = mount(ServiceList, {
        global: {
          plugins: [
            createTestingPinia({
              createSpy: vi.fn,
              initialState: {
                services: {
                  isLoading: false,
                  services: mockServices,
                  error: null,
                  selectedService: mockServices[0],
                },
              },
            }),
            router,
          ],
        },
      })

      const push = vi.spyOn(router, 'push')
      await wrapper.find('.btn-primary').trigger('click')

      expect(push).toHaveBeenCalledWith('/booking')
    })
  })
})
