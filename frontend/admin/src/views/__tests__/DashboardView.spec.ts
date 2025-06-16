import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from "../DashboardView.vue";
import type { BookingView } from "../../types";

// Create mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: DashboardView
    }
  ]
});

// Mock the store
const createMockStore = () => ({
  bookings: [] as BookingView[],
  totalBookings: 0,
  todayBookings: 0,
  upcomingBookings: 0,
  isLoading: false,
  error: null,
  fetchDashboardStats: vi.fn().mockResolvedValue(undefined),
  fetchUpcomingBookings: vi.fn().mockResolvedValue(undefined),
});

let mockStore = createMockStore();

// Mock the store module with the correct path
vi.mock("@/stores/bookings", () => ({
  useBookingStore: () => mockStore
}));

describe("DashboardView", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockStore = createMockStore();
    vi.clearAllMocks();
  });

  const mountComponent = async () => {
    const wrapper = mount(DashboardView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true
        }
      }
    });
    await flushPromises();
    return wrapper;
  };

  it("should render statistics cards", async () => {
    const wrapper = await mountComponent();

    // Test statistics section exists
    const statsSection = wrapper.find('[data-test="statistics-cards"]');
    expect(statsSection.exists()).toBe(true);

    // Test individual stat cards
    expect(wrapper.find('[data-test="total-bookings"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="today-bookings"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="upcoming-bookings"]').exists()).toBe(true);
  });

  it("should display bookings table", async () => {
    // Add mock bookings data so the table is rendered
    mockStore.bookings = [
      {
        id: "1",
        customerName: "John Doe",
        employeeName: "Jane Smith",
        serviceName: "Haircut",
        startTime: "2023-12-01T10:00:00Z",
        status: "CONFIRMED"
      }
    ];

    const wrapper = await mountComponent();

    // Test bookings table exists
    const bookingsTable = wrapper.find('[data-test="bookings-table"]');
    expect(bookingsTable.exists()).toBe(true);

    // Test table headers
    const headers = wrapper.findAll("th");
    expect(headers.length).toBeGreaterThan(0);
    expect(headers.some((header) => header.text().includes("Kunde"))).toBe(
      true,
    );
    expect(headers.some((header) => header.text().includes("Tjeneste"))).toBe(
      true,
    );
    expect(headers.some((header) => header.text().includes("Dato"))).toBe(true);
  });

  it("should load dashboard data on mount", async () => {
    await mountComponent();
    await flushPromises();

    // Verify store actions were called
    expect(mockStore.fetchDashboardStats).toHaveBeenCalledTimes(1);
  });

  it("should show loading state while fetching data", async () => {
    // Set loading state before mounting
    mockStore.isLoading = true;
    const wrapper = await mountComponent();

    // Test loading state is shown
    const loadingState = wrapper.find('[data-test="loading-state"]');
    expect(loadingState.exists()).toBe(true);
    expect(loadingState.text()).toContain("Laster bestillinger");

    mockStore.isLoading = false;
  });

  it("should display refresh button", async () => {
    const wrapper = await mountComponent();

    // Test refresh button exists
    const refreshButton = wrapper.find('[data-test="refresh-button"]');
    expect(refreshButton.exists()).toBe(true);
    expect(refreshButton.text()).toBe("Oppdater");
  });

  it("should handle refresh click", async () => {
    const wrapper = await mountComponent();
    
    // Clear mock calls from mounting
    mockStore.fetchDashboardStats.mockClear();

    // Click refresh button
    const refreshButton = wrapper.find('[data-test="refresh-button"]');
    await refreshButton.trigger("click");
    await flushPromises();

    // Verify store action was called with forceRefresh=true
    expect(mockStore.fetchDashboardStats).toHaveBeenCalledWith(true);
    expect(mockStore.fetchDashboardStats).toHaveBeenCalledTimes(1);
  });
});
