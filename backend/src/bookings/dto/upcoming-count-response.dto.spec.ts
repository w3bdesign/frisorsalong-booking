import { UpcomingCustomerDto, UpcomingCountResponseDto } from './upcoming-count-response.dto';

describe('UpcomingCustomerDto', () => {
  it('should create a valid UpcomingCustomerDto instance', () => {
    const dto = new UpcomingCustomerDto();
    dto.firstName = 'John';
    dto.estimatedWaitingTime = 30;

    expect(dto).toBeDefined();
    expect(dto.firstName).toBe('John');
    expect(dto.estimatedWaitingTime).toBe(30);
  });
});

describe('UpcomingCountResponseDto', () => {
  it('should create a valid UpcomingCountResponseDto instance', () => {
    const customerDto = new UpcomingCustomerDto();
    customerDto.firstName = 'John';
    customerDto.estimatedWaitingTime = 30;

    const dto = new UpcomingCountResponseDto();
    dto.count = 1;
    dto.customers = [customerDto];

    expect(dto).toBeDefined();
    expect(dto.count).toBe(1);
    expect(dto.customers).toHaveLength(1);
    expect(dto.customers[0]).toEqual({
      firstName: 'John',
      estimatedWaitingTime: 30,
    });
  });

  it('should handle multiple customers', () => {
    const customer1 = new UpcomingCustomerDto();
    customer1.firstName = 'John';
    customer1.estimatedWaitingTime = 30;

    const customer2 = new UpcomingCustomerDto();
    customer2.firstName = 'Jane';
    customer2.estimatedWaitingTime = 60;

    const dto = new UpcomingCountResponseDto();
    dto.count = 2;
    dto.customers = [customer1, customer2];

    expect(dto.count).toBe(2);
    expect(dto.customers).toHaveLength(2);
    expect(dto.customers).toEqual([
      { firstName: 'John', estimatedWaitingTime: 30 },
      { firstName: 'Jane', estimatedWaitingTime: 60 },
    ]);
  });

  it('should handle empty customers array', () => {
    const dto = new UpcomingCountResponseDto();
    dto.count = 0;
    dto.customers = [];

    expect(dto.count).toBe(0);
    expect(dto.customers).toHaveLength(0);
  });
});
