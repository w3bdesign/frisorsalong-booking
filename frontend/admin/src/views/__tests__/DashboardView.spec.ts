import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import DashboardView from "../DashboardView.vue";

// Mock the store
const mockStore = {
  bookings: [],
  totalBookings: 0,
  todayBookings: 0,
  upcomingBookings: 0,
  isLoading: false,
  fetchDashboardStats: vi.fn(),
  fetchUpcomingBookings: vi.fn(),
};

vi.mock("@/stores/bookings", () => ({
  useBookingStore: () => mockStore,
}));

describe("DashboardView", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should render statistics cards", () => {
    const wrapper = mount(DashboardView);

    // Test statistics section exists
    const statsSection = wrapper.find('[data-test="statistics-cards"]');
    expect(statsSection.exists()).toBe(true);

    // Test individual stat cards
    expect(wrapper.find('[data-test="total-bookings"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="today-bookings"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="upcoming-bookings"]').exists()).toBe(true);
  });

  it("should display bookings table", () => {
    const wrapper = mount(DashboardView);

    // Test bookings table exists
    const bookingsTable = wrapper.find('[data-test="bookings-table"]');
    expect(bookingsTable.exists()).toBe(true);

    // Test table headers
    const headers = wrapper.findAll("th");
    expect(headers.length).toBeGreaterThan(0);
    expect(headers.some((header) => header.text().includes("Customer"))).toBe(
      true,
    );
    expect(headers.some((header) => header.text().includes("Service"))).toBe(
      true,
    );
    expect(headers.some((header) => header.text().includes("Date"))).toBe(true);
  });

  it("should load dashboard data on mount", async () => {
    mount(DashboardView);

    // Verify store actions were called
    expect(mockStore.fetchDashboardStats).toHaveBeenCalled();
  });

  it("should show loading state while fetching data", async () => {
    mockStore.isLoading = true;
    const wrapper = mount(DashboardView);

    // Test loading state is shown
    const loadingState = wrapper.find('[data-test="loading-state"]');
    expect(loadingState.exists()).toBe(true);
    expect(loadingState.text()).toContain("Loading");

    mockStore.isLoading = false;
  });

  it("should display refresh button", () => {
    const wrapper = mount(DashboardView);

    // Test refresh button exists
    const refreshButton = wrapper.find('[data-test="refresh-button"]');
    expect(refreshButton.exists()).toBe(true);
    expect(refreshButton.text()).toBe("Refresh");
  });

  it("should handle refresh click", async () => {
    const wrapper = mount(DashboardView);

    // Click refresh button
    const refreshButton = wrapper.find('[data-test="refresh-button"]');
    await refreshButton.trigger("click");

    // Verify store action was called
    expect(mockStore.fetchDashboardStats).toHaveBeenCalled();
  });
});
