import { Order } from './order.entity';
import { Booking } from '../../bookings/entities/booking.entity';

describe('Order Entity', () => {
  let order: Order;

  beforeEach(() => {
    order = new Order();
  });

  it('should create an order instance', () => {
    expect(order).toBeDefined();
    expect(order).toBeInstanceOf(Order);
  });

  it('should have correct properties', () => {
    // Create mock data
    const mockBooking = new Booking();
    const mockDate = new Date();
    const mockNotes = 'Test notes';

    // Set properties
    order.id = 'test-id';
    order.booking = mockBooking;
    order.completedAt = mockDate;
    order.totalAmount = 299.99;
    order.notes = mockNotes;
    order.createdAt = mockDate;
    order.updatedAt = mockDate;

    // Verify properties
    expect(order.id).toBe('test-id');
    expect(order.booking).toBe(mockBooking);
    expect(order.completedAt).toBe(mockDate);
    expect(order.totalAmount).toBe(299.99);
    expect(order.notes).toBe(mockNotes);
    expect(order.createdAt).toBe(mockDate);
    expect(order.updatedAt).toBe(mockDate);
  });

  it('should handle decimal total amounts', () => {
    order.totalAmount = 299.99;
    expect(order.totalAmount).toBe(299.99);
  });

  it('should handle optional notes', () => {
    expect(order.notes).toBeUndefined();
    order.notes = 'Test notes';
    expect(order.notes).toBe('Test notes');
  });

  it('should require non-null properties', () => {
    // TypeScript should enforce these as non-null
    expect(() => {
      const completeOrder = new Order();
      completeOrder.id = 'test-id';
      completeOrder.booking = new Booking();
      completeOrder.completedAt = new Date();
      completeOrder.totalAmount = 299.99;
      completeOrder.createdAt = new Date();
      completeOrder.updatedAt = new Date();
    }).not.toThrow();
  });
});
