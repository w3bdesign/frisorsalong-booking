export interface Order {
  id: string
  completedAt: string
  totalAmount: string
  notes: string
  createdAt: string
  updatedAt: string
  booking: Booking
}

export interface Booking {
  id: string
  startTime: string
  endTime: string
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED'
  notes: string
  totalPrice: string
  reminderSent: boolean
  cancelledAt: string | null
  cancellationReason: string | null
  createdAt: string
  updatedAt: string
  customer: Customer
  employee: Employee
  service: Service
}

// This interface represents the simplified booking data used in views
export interface BookingView {
  id: string | number;
  customerName: string;
  employeeName: string;
  serviceName: string;
  startTime: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
}

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: string
  specializations: string[]
  availability: {
    [key: string]: Array<{ start: string; end: string }>
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
