import { IsOptional, IsEnum, IsString, IsDateString } from "class-validator";
import { Exclude, Transform } from "class-transformer";
import { BookingStatus } from "../entities/booking.entity";

export class UpdateBookingDto {
  @Exclude()
  id?: string;

  @Exclude()
  customerName?: string;

  @Exclude()
  employeeName?: string;

  @Exclude()
  serviceName?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  @Transform(({ value }) => value?.toLowerCase())
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
