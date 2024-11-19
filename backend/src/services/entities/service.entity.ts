import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  durationMinutes: number;

  @ManyToMany(() => Employee)
  @JoinTable({
    name: 'employee_services',
    joinColumn: {
      name: 'service_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'employee_id',
      referencedColumnName: 'id',
    },
  })
  employees: Employee[];

  @Column({ default: true })
  isActive: boolean;

  @Column('simple-array', { nullable: true })
  categories: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
