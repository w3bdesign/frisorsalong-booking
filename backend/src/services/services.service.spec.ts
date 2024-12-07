import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ServicesService } from "./services.service";
import { Service } from "./entities/service.entity";
import { NotFoundException } from "@nestjs/common";

describe("ServicesService", () => {
  let service: ServicesService;

  const mockService = {
    id: "service-1",
    name: "Haircut",
    description: "Basic haircut service",
    duration: 60,
    price: 50,
  };

  const mockServiceRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(Service),
          useValue: mockServiceRepository,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOne", () => {
    it("should return a service when found", async () => {
      mockServiceRepository.findOne.mockResolvedValue(mockService);

      const result = await service.findOne("service-1");
      expect(result).toEqual(mockService);
      expect(mockServiceRepository.findOne).toHaveBeenCalledWith({
        where: { id: "service-1" },
      });
    });

    it("should throw NotFoundException when service not found", async () => {
      mockServiceRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("non-existent")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("findAll", () => {
    it("should return all services", async () => {
      const mockServices = [mockService];
      mockServiceRepository.find.mockResolvedValue(mockServices);

      const result = await service.findAll();
      expect(result).toEqual(mockServices);
      expect(mockServiceRepository.find).toHaveBeenCalled();
    });

    it("should return empty array when no services exist", async () => {
      mockServiceRepository.find.mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(mockServiceRepository.find).toHaveBeenCalled();
    });
  });

  describe("findByEmployee", () => {
    it("should return services for an employee", async () => {
      const mockServices = [mockService];
      mockServiceRepository.find.mockResolvedValue(mockServices);

      const result = await service.findByEmployee("employee-1");
      expect(result).toEqual(mockServices);
      expect(mockServiceRepository.find).toHaveBeenCalledWith({
        where: {
          employees: {
            id: "employee-1",
          },
        },
        relations: ["employees"],
      });
    });

    it("should return empty array when employee has no services", async () => {
      mockServiceRepository.find.mockResolvedValue([]);

      const result = await service.findByEmployee("employee-1");
      expect(result).toEqual([]);
      expect(mockServiceRepository.find).toHaveBeenCalledWith({
        where: {
          employees: {
            id: "employee-1",
          },
        },
        relations: ["employees"],
      });
    });
  });
});
