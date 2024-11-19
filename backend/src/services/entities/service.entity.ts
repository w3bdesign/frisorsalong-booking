import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from "typeorm";
import { Employee } from "../../employees/entities/employee.entity";

@Entity("services")
export class Service {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column("text")
  description: string;

  @Column("int")
  duration: number; // Duration in minutes

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Employee, (employee) => employee.services)
  employees: Employee[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
