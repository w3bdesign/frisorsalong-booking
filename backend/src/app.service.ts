import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return `Welcome to the Hair Salon Booking API! Please visit /api-docs for the API documentation.`;
  }
}
