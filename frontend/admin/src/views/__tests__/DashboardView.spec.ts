import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DashboardView from '../DashboardView.vue'
import { ElCard, ElStatistic } from 'element-plus'

// Mock the store we'll need later
const mockStore = {
  bookings: [],
  totalBookings: 0,
  todayBookings: 0,
  isLoading: false,
  fetchDashboardStats: vi.fn(),
  fetchUpcomingBookings: vi.fn()
}

vi.mock('@/stores/bookings', () => ({
  useBookingStore: () => mockStore
}))

describe('DashboardView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render statistics cards', () => {
    const wrapper = mount(DashboardView)
    
    // Test statistics section exists
    expect(wrapper.findComponent(ElCard).exists()).toBe(true)
    expect(wrapper.findAllComponents(ElStatistic).length).toBe(3)
    
    // Test statistic titles
    const statistics = wrapper.findAllComponents(ElStatistic)
    expect(statistics[0].props('title')).toBe('Total Bookings')
    expect(statistics[1].props('title')).toBe('Today\'s Bookings')
    expect(statistics[2].props('title')).toBe('Available Time Slots')
  })

  it('should display upcoming bookings section', () => {
    const wrapper = mount(DashboardView)
    
    // Test bookings table exists
    const bookingsTable = wrapper.find('[data-test="bookings-table"]')
    expect(bookingsTable.exists()).toBe(true)
    
    // Test table headers
    const headers = wrapper.findAll('th')
    expect(headers.length).toBeGreaterThan(0)
    expect(headers.some(header => header.text().includes('Customer'))).toBe(true)
    expect(headers.some(header => header.text().includes('Service'))).toBe(true)
    expect(headers.some(header => header.text().includes('Date'))).toBe(true)
  })

  it('should load dashboard data on mount', async () => {
    const wrapper = mount(DashboardView)
    
    // Verify store actions were called
    expect(mockStore.fetchDashboardStats).toHaveBeenCalled()
    expect(mockStore.fetchUpcomingBookings).toHaveBeenCalled()
  })

  it('should show loading state while fetching data', async () => {
    mockStore.isLoading = true
    const wrapper = mount(DashboardView)
    
    // Test loading skeleton is shown
    expect(wrapper.find('.el-skeleton').exists()).toBe(true)
    
    mockStore.isLoading = false
  })

  it('should display navigation menu for admin functions', () => {
    const wrapper = mount(DashboardView)
    
    // Test navigation menu exists
    const menu = wrapper.find('[data-test="admin-menu"]')
    expect(menu.exists()).toBe(true)
    
    // Test menu items
    const menuItems = wrapper.findAll('[data-test="menu-item"]')
    expect(menuItems.some(item => item.text().includes('Manage Employees'))).toBe(true)
    expect(menuItems.some(item => item.text().includes('Manage Services'))).toBe(true)
  })
})
