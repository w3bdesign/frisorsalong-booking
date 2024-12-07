export interface CreateWalkInBookingParams {
  serviceId: string;
  firstName: string;
  phoneNumber: string;
  isPaid: boolean;
}

export interface BookingResponse {
  id: string;
  serviceId: string;
  firstName: string;
  phoneNumber: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface PendingBooking extends Omit<CreateWalkInBookingParams, 'isPaid'> {
  isPaid?: boolean;
}

export interface BookingState {
  currentBooking: BookingResponse | null;
  pendingBooking: PendingBooking | null;
  isLoading: boolean;
  error: string | null;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServicesState {
  services: Service[];
  selectedService: Service | null;
  isLoading: boolean;
  error: string | null;
}
