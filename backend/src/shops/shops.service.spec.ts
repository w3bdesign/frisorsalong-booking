import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShopsService } from './shops.service';
import { ShopCode } from './entities/shop-code.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('ShopsService', () => {
  let service: ShopsService;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopsService,
        {
          provide: getRepositoryToken(ShopCode),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ShopsService>(ShopsService);
    jest.clearAllMocks();
  });

  describe('validateShopCode', () => {
    it('should validate a shop code successfully', async () => {
      const mockShopCode = {
        code: 'TEST123',
        isActive: true,
        todayBookingCount: 0,
        dailyBookingLimit: 100,
        lastBookingTime: null,
      };

      mockRepository.findOne.mockResolvedValue(mockShopCode);
      mockRepository.save.mockResolvedValue({ ...mockShopCode, todayBookingCount: 1 });

      const result = await service.validateShopCode('TEST123');

      expect(result).toBeDefined();
      expect(result.todayBookingCount).toBe(1);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { code: 'TEST123', isActive: true },
      });
    });

    it('should throw UnauthorizedException for invalid shop code', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.validateShopCode('INVALID')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { code: 'INVALID', isActive: true },
      });
    });

    it('should throw UnauthorizedException when daily limit is reached', async () => {
      const mockShopCode = {
        code: 'TEST123',
        isActive: true,
        todayBookingCount: 100,
        dailyBookingLimit: 100,
        lastBookingTime: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockShopCode);

      await expect(service.validateShopCode('TEST123')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { code: 'TEST123', isActive: true },
      });
    });

    it('should reset counter for a new day', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockShopCode = {
        code: 'TEST123',
        isActive: true,
        todayBookingCount: 100,
        dailyBookingLimit: 100,
        lastBookingTime: yesterday,
      };

      mockRepository.findOne.mockResolvedValue(mockShopCode);
      mockRepository.save.mockResolvedValue({ ...mockShopCode, todayBookingCount: 1 });

      const result = await service.validateShopCode('TEST123');

      expect(result.todayBookingCount).toBe(1);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('createShopCode', () => {
    it('should create a shop code with provided code', async () => {
      const mockShopCode = {
        code: 'TEST123',
        shopName: 'Test Shop',
      };

      mockRepository.create.mockReturnValue(mockShopCode);
      mockRepository.save.mockResolvedValue(mockShopCode);

      const result = await service.createShopCode('Test Shop', 'TEST123');

      expect(result).toEqual(mockShopCode);
      expect(mockRepository.create).toHaveBeenCalledWith(mockShopCode);
      expect(mockRepository.save).toHaveBeenCalledWith(mockShopCode);
    });

    it('should create a shop code with auto-generated code', async () => {
      mockRepository.create.mockImplementation((data: Partial<ShopCode>) => data as ShopCode);
      mockRepository.save.mockImplementation((data: ShopCode) => Promise.resolve(data));

      const result = await service.createShopCode('Test Shop');

      expect(result).toBeDefined();
      expect(result.shopName).toBe('Test Shop');
      expect(result.code).toBeDefined();
      expect(typeof result.code).toBe('string');
      expect(result.code.length).toBe(6);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('deactivateShopCode', () => {
    it('should deactivate a shop code', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.deactivateShopCode('TEST123');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { code: 'TEST123' },
        { isActive: false },
      );
    });
  });

  describe('updateDailyLimit', () => {
    it('should update daily booking limit', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateDailyLimit('TEST123', 200);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { code: 'TEST123' },
        { dailyBookingLimit: 200 },
      );
    });
  });
});
