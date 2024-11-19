export class BookingResponseDto {
  id: string;
  customerName: string;
  employeeName: string;
  serviceName: string;
  startTime: string;
  status: string;

  static fromEntity(booking: any): BookingResponseDto {
    const dto = new BookingResponseDto();
    dto.id = booking.id;
    dto.customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
    dto.employeeName = `${booking.employee.user.firstName} ${booking.employee.user.lastName}`;
    dto.serviceName = booking.service.name;
    dto.startTime = booking.startTime;
    dto.status = booking.status;
    return dto;
  }

  static fromEntities(bookings: any[]): BookingResponseDto[] {
    return bookings.map(booking => BookingResponseDto.fromEntity(booking));
  }
}
