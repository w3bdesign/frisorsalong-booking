import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from "class-validator";
import { UserRole } from "../../users/entities/user.entity";

export class RegisterDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  @IsEmail({}, { message: "Vennligst oppgi en gyldig e-postadresse" })
  email: string;

  @ApiProperty({
    example: "Password123!",
    description: "User password (min 8 characters)",
  })
  @IsString()
  @MinLength(8, { message: "Passordet må være minst 8 tegn langt" })
  password: string;

  @ApiProperty({
    example: "John",
    description: "User first name",
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: "Doe",
    description: "User last name",
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.CUSTOMER,
    description: "User role",
    default: UserRole.CUSTOMER,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.CUSTOMER;
}
