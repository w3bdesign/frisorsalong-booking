import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useServicesStore } from '../services'
import type { Service } from '../types'

// Test data
const createMockService = (overrides: Partial<Service> = {}): Service => ({
  id: '1',
  name: 'Haircut',
  description: 'Basic haircut',
  duration: 30,
  price: '300',
  isActive: true,
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01',
  ...overrides,
});

// Helper functions
const mockFetchSuccess = (response: Service[] = []) => {
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
    }),
  );
};

const mockFetchError = (message: string) => {
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ message }),
    }),
  );
};

const mockNetworkError = (message: string) => {
  global.fetch = vi.fn().mockImplementation(() => 
    Promise.reject(new Error(message))
  );
};

const waitForInitialFetch = () => new Promise((resolve) => setImmediate(resolve));

describe('Services Store', () => {
  let store: ReturnType<typeof useServicesStore>;
  const mockService = createMockService();

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockFetchSuccess([]); // Default to empty services list
    store = useServicesStore();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('has correct empty initial state', async () => {
    // Initial state should show loading
    expect(store.isLoading).toBeTruthy();
    expect(store.services).toEqual([]);
    expect(store.error).toBeNull();
    expect(store.selectedService).toBeNull();

    // Wait for the initial fetch to complete
    await waitForInitialFetch();

    // After fetch completes
    expect(store.isLoading).toBeFalsy();
    expect(store.services).toEqual([]);
    expect(store.error).toBeNull();
    expect(store.selectedService).toBeNull();
  });

  it('fetches services successfully', async () => {
    mockFetchSuccess([mockService]);
    await store.fetchServices();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/services');
    expect(store.services).toEqual([mockService]);
    expect(store.isLoading).toBeFalsy();
    expect(store.error).toBeNull();
  });

  it('handles fetch error', async () => {
    mockFetchError('Failed to fetch services');
    await store.fetchServices();

    expect(store.services).toEqual([]);
    expect(store.isLoading).toBeFalsy();
    expect(store.error).toBe('Failed to fetch services');
  });

  it('handles network error', async () => {
    mockNetworkError('Network error');
    await store.fetchServices();

    expect(store.services).toEqual([]);
    expect(store.isLoading).toBeFalsy();
    expect(store.error).toBe('Network error');
  });

  it('selects a service', async () => {
    await waitForInitialFetch();

    store.selectService(mockService);
    expect(store.selectedService).toEqual(mockService);
  });

  it('clears selected service', async () => {
    await waitForInitialFetch();

    // First select a service
    store.selectService(mockService);
    expect(store.selectedService).toEqual(mockService);

    // Then clear it
    store.clearSelection();
    expect(store.selectedService).toBeNull();
  });
});
