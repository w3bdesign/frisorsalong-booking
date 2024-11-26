export class UpcomingCustomerDto {
  firstName: string;
  estimatedWaitingTime: number; // in minutes
}

export class UpcomingCountResponseDto {
  count: number;
  customers: UpcomingCustomerDto[];
}
