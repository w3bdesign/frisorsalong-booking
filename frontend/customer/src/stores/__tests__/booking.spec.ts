import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBookingStore } from '../booking'
import type { CreateWalkInBookingParams } from '../types'

// Test data
interface MockResponse {
  id: string;
  serviceId: string;
  firstName: string;
  phoneNumber: string;
  status: 'confirmed';
}

const createMockBooking = (overrides: Partial<CreateWalkInBookingParams> = {}): CreateWalkInBookingParams => ({
  serviceId: '1',
  firstName: 'Test',
  phoneNumber: '12345678',
  isPaid: true,
  ...overrides,
});

const createMockResponse = (overrides: Partial<MockResponse> = {}): MockResponse => ({
  id: '1',
  serviceId: '1',
  firstName: 'Test',
  phoneNumber: '12345678',
  status: 'confirmed',
  ...overrides,
});

// Helper functions
const mockFetchSuccess = (response: any) => {
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

const verifyFetchCall = (mockBooking: CreateWalkInBookingParams) => {
  expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:3000/bookings/walk-in',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shop-Code': 'SHOP123',
        accept: '*/*',
      },
      body: JSON.stringify(mockBooking),
    }
  );
};

// Tests
describe('Booking Store', () => {
  let store: ReturnType<typeof useBookingStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    store = useBookingStore();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('has empty initial state', () => {
    expect(store.currentBooking).toBeNull();
    expect(store.pendingBooking).toBeNull();
    expect(store.isLoading).toBeFalsy();
    expect(store.error).toBeNull();
  });

  it('creates walk-in booking successfully', async () => {
    const mockBooking = createMockBooking();
    const mockResponse = createMockResponse();
    mockFetchSuccess(mockResponse);

    await store.createWalkInBooking(mockBooking);

    verifyFetchCall(mockBooking);
    expect(store.currentBooking).toEqual(mockResponse);
    expect(store.isLoading).toBeFalsy();
    expect(store.error).toBeNull();
  });

  it('handles fetch error in walk-in booking', async () => {
    const mockBooking = createMockBooking();
    const errorMessage = 'Failed to create booking';
    mockFetchError(errorMessage);

    await expect(store.createWalkInBooking(mockBooking))
      .rejects
      .toThrow(errorMessage);

    verifyFetchCall(mockBooking);
    expect(store.currentBooking).toBeNull();
    expect(store.isLoading).toBeFalsy();
    expect(store.error).toBe(errorMessage);
  });

  it('handles network error in walk-in booking', async () => {
    const mockBooking = createMockBooking();
    const errorMessage = 'Network error';
    mockNetworkError(errorMessage);

    await expect(store.createWalkInBooking(mockBooking))
      .rejects
      .toThrow(errorMessage);

    verifyFetchCall(mockBooking);
    expect(store.currentBooking).toBeNull();
    expect(store.isLoading).toBeFalsy();
    expect(store.error).toBe(errorMessage);
  });

  it('sets pending booking', () => {
    const pendingBooking = createMockBooking();
    store.setPendingBooking(pendingBooking);
    expect(store.pendingBooking).toEqual(pendingBooking);
  });

  it('clears booking state', async () => {
    // Setup: Create a booking first
    const mockBooking = createMockBooking();
    const mockResponse = createMockResponse();
    mockFetchSuccess(mockResponse);
    await store.createWalkInBooking(mockBooking);
    expect(store.currentBooking).toEqual(mockResponse);

    // Test: Clear the booking
    store.clearBooking();

    expect(store.currentBooking).toBeNull();
    expect(store.pendingBooking).toBeNull();
    expect(store.error).toBeNull();
  });
});
