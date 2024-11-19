import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Service } from "./entities/service.entity";

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async findAll(): Promise<Service[]> {
    return this.serviceRepository.find();
  }

  async findByEmployee(employeeId: string): Promise<Service[]> {
    return this.serviceRepository.find({
      where: {
        employees: {
          id: employeeId,
        },
      },
      relations: ["employees"],
    });
  }
}
