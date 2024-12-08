import { Booking, BookingStatus } from "../entities/booking.entity";
import { User } from "../../users/entities/user.entity";
import { Employee } from "../../employees/entities/employee.entity";
import { Service } from "../../services/entities/service.entity";

interface BookingWithRelations extends Booking {
  customer: User;
  employee: Employee & { user: User };
  service: Service;
}

export class BookingResponseDto {
  id: string;
  customerName: string;
  employeeName: string;
  serviceName: string;
  startTime: string;
  status: BookingStatus;

  static fromEntity(booking: BookingWithRelations): BookingResponseDto {
    const dto = new BookingResponseDto();
    dto.id = booking.id;
    dto.customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
    dto.employeeName = `${booking.employee.user.firstName} ${booking.employee.user.lastName}`;
    dto.serviceName = booking.service.name;
    dto.startTime = booking.startTime.toISOString();
    dto.status = booking.status;
    return dto;
  }

  static fromEntities(bookings: BookingWithRelations[]): BookingResponseDto[] {
    return bookings.map(booking => BookingResponseDto.fromEntity(booking));
  }
}
