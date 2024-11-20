import { Order } from './order.entity';
import { getMetadataArgsStorage } from 'typeorm';

describe('Order Entity', () => {
  it('should create an order instance', () => {
    const order = new Order();
    expect(order).toBeTruthy();
    expect(order).toBeInstanceOf(Order);
  });

  it('should have all required properties defined', () => {
    const metadata = getMetadataArgsStorage();
    const columns = metadata.columns.filter(
      column => column.target === Order
    );
    const relations = metadata.relations.filter(
      relation => relation.target === Order
    );

    // Check if all required properties are defined as columns or relations
    const properties = [
      ...columns.map(column => column.propertyName),
      ...relations.map(relation => relation.propertyName)
    ];

    expect(properties).toContain('id');
    expect(properties).toContain('booking');
    expect(properties).toContain('completedAt');
    expect(properties).toContain('totalAmount');
    expect(properties).toContain('notes');
    expect(properties).toContain('createdAt');
    expect(properties).toContain('updatedAt');
  });
});
