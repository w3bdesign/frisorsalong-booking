import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsOptional,
  IsBoolean,
} from "class-validator";

export class CreateWalkInBookingDto {
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsNotEmpty()
  @IsBoolean()
  isPaid: boolean;
}
