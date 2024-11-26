import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingResponseDto,
  UpcomingCountResponseDto,
} from './index';

describe('DTO exports', () => {
  it('should export CreateBookingDto', () => {
    expect(CreateBookingDto).toBeDefined();
    const dto = new CreateBookingDto();
    expect(dto).toBeInstanceOf(CreateBookingDto);
  });

  it('should export UpdateBookingDto', () => {
    expect(UpdateBookingDto).toBeDefined();
    const dto = new UpdateBookingDto();
    expect(dto).toBeInstanceOf(UpdateBookingDto);
  });

  it('should export BookingResponseDto', () => {
    expect(BookingResponseDto).toBeDefined();
    const dto = new BookingResponseDto();
    expect(dto).toBeInstanceOf(BookingResponseDto);
  });

  it('should export UpcomingCountResponseDto', () => {
    expect(UpcomingCountResponseDto).toBeDefined();
    const dto = new UpcomingCountResponseDto();
    expect(dto).toBeInstanceOf(UpcomingCountResponseDto);
  });
});
