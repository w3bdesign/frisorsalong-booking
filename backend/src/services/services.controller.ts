import { Controller, Get, Param } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({
    status: 200,
    description: 'Returns all available services',
    type: [Service],
  })
  async findAll(): Promise<Service[]> {
    return this.servicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by id' })
  @ApiResponse({
    status: 200,
    description: 'Returns the service with the specified id',
    type: Service,
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async findOne(@Param('id') id: string): Promise<Service> {
    return this.servicesService.findOne(id);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get services by employee id' })
  @ApiResponse({
    status: 200,
    description: 'Returns all services offered by the specified employee',
    type: [Service],
  })
  async findByEmployee(@Param('employeeId') employeeId: string): Promise<Service[]> {
    return this.servicesService.findByEmployee(employeeId);
  }
}
