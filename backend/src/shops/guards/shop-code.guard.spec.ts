import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ShopCodeGuard } from './shop-code.guard';
import { ShopsService } from '../shops.service';
import { Test } from '@nestjs/testing';
import { ShopCode } from '../entities/shop-code.entity';

describe('ShopCodeGuard', () => {
  let guard: ShopCodeGuard;
  let shopsService: ShopsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ShopCodeGuard,
        {
          provide: ShopsService,
          useValue: {
            validateShopCode: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = moduleRef.get<ShopCodeGuard>(ShopCodeGuard);
    shopsService = moduleRef.get<ShopsService>(ShopsService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access with valid shop code', async () => {
      const mockShopCode: ShopCode = {
        id: '1',
        code: 'TEST123',
        shopName: 'Test Shop',
        isActive: true,
        dailyBookingLimit: 100,
        todayBookingCount: 0,
        lastBookingTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              'x-shop-code': 'TEST123',
            },
          }),
        }),
      } as ExecutionContext;

      jest.spyOn(shopsService, 'validateShopCode').mockResolvedValue(mockShopCode);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(shopsService.validateShopCode).toHaveBeenCalledWith('TEST123');
    });

    it('should throw UnauthorizedException when shop code header is missing', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
      expect(shopsService.validateShopCode).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when shop code is invalid', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              'x-shop-code': 'INVALID',
            },
          }),
        }),
      } as ExecutionContext;

      jest.spyOn(shopsService, 'validateShopCode').mockRejectedValue(new UnauthorizedException());

      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
      expect(shopsService.validateShopCode).toHaveBeenCalledWith('INVALID');
    });
  });
});
