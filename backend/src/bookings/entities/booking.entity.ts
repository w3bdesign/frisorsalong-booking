import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Employee } from "../../employees/entities/employee.entity";
import { Service } from "../../services/entities/service.entity";

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  NO_SHOW = "no_show",
}

@Entity("bookings")
export class Booking {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "customer_id" })
  customer: User;

  @ManyToOne(() => Employee, { nullable: false })
  @JoinColumn({ name: "employee_id" })
  employee: Employee;

  @ManyToOne(() => Service, { nullable: false })
  @JoinColumn({ name: "service_id" })
  service: Service;

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "timestamp" })
  endTime: Date;

  @Column({
    type: "enum",
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column("text", { nullable: true })
  notes: string;

  @Column("decimal", { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ default: false })
  reminderSent: boolean;

  @Column({ type: "timestamp", nullable: true })
  cancelledAt: Date;

  @Column({ type: "text", nullable: true })
  cancellationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
