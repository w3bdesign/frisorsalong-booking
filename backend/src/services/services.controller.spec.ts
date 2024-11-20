import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';
import { NotFoundException } from '@nestjs/common';

describe('ServicesController', () => {
  let controller: ServicesController;
  let service: ServicesService;

  const mockService: Service = {
    id: '1',
    name: 'Standard Klipp',
    description: 'En standard og effektiv hårklipp',
    duration: 20,
    price: 299,
    isActive: true,
    employees: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockServicesService = {
    findAll: jest.fn().mockResolvedValue([mockService]),
    findOne: jest.fn().mockResolvedValue(mockService),
    findByEmployee: jest.fn().mockResolvedValue([mockService]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
    service = module.get<ServicesService>(ServicesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of services', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockService]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a service by id', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockService);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when service is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmployee', () => {
    it('should return services by employee id', async () => {
      const result = await controller.findByEmployee('1');
      expect(result).toEqual([mockService]);
      expect(service.findByEmployee).toHaveBeenCalledWith('1');
    });
  });
});
