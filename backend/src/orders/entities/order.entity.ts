import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Booking } from "../../bookings/entities/booking.entity";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @OneToOne(() => Booking, { nullable: false })
  @JoinColumn({ name: "booking_id" })
  booking!: Booking;

  @Column({ type: "timestamp", name: "completed_at" })
  completedAt!: Date;

  @Column("decimal", { precision: 10, scale: 2, name: "total_amount" })
  totalAmount!: number;

  @Column("text", { nullable: true })
  notes?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
