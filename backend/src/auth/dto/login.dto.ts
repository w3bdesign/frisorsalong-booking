import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
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
}
