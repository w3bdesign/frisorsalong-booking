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

  @Column({ type: "timestamp" })
  completedAt!: Date;

  @Column("decimal", { precision: 10, scale: 2 })
  totalAmount!: number;

  @Column("text", { nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
