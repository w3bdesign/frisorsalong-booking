import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("shop_codes")
export class ShopCode {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ name: "shop_name" })
  shopName: string;

  @Column({ default: true, name: "is_active" })
  isActive: boolean;

  @Column({ type: "int", default: 100, name: "daily_booking_limit" })
  dailyBookingLimit: number;

  @Column({ type: "timestamp", nullable: true, name: "last_booking_time" })
  lastBookingTime: Date;

  @Column({ type: "int", default: 0, name: "today_booking_count" })
  todayBookingCount: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
