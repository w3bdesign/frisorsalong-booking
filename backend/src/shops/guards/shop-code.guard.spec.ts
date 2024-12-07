import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ShopCodeGuard } from './shop-code.guard';
import { ShopsService } from '../shops.service';
import { Test } from '@nestjs/testing';
import { ShopCode } from '../entities/shop-code.entity';

// Helper functions to reduce nesting
const createMockContext = (headers: Record<string, string> = {}): ExecutionContext => ({
  switchToHttp: () => ({
    getRequest: () => ({
      headers,
    }),
  }),
}) as ExecutionContext;

const createMockShopCode = (overrides: Partial<ShopCode> = {}): ShopCode => ({
  id: '1',
  code: 'TEST123',
  shopName: 'Test Shop',
  isActive: true,
  dailyBookingLimit: 100,
  todayBookingCount: 0,
  lastBookingTime: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

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

  test('guard should be defined', () => {
    expect(guard).toBeDefined();
  });

  test('allows access with valid shop code', async () => {
    // Arrange
    const mockShopCode = createMockShopCode();
    const mockContext = createMockContext({ 'x-shop-code': 'TEST123' });
    jest.spyOn(shopsService, 'validateShopCode').mockResolvedValue(mockShopCode);

    // Act
    const result = await guard.canActivate(mockContext);

    // Assert
    expect(result).toBe(true);
    expect(shopsService.validateShopCode).toHaveBeenCalledWith('TEST123');
  });

  test('throws UnauthorizedException when shop code header is missing', async () => {
    // Arrange
    const mockContext = createMockContext();
    const validateSpy = jest.spyOn(shopsService, 'validateShopCode');

    // Act & Assert
    await expect(guard.canActivate(mockContext))
      .rejects
      .toThrow(UnauthorizedException);
    
    expect(validateSpy).not.toHaveBeenCalled();
  });

  test('throws UnauthorizedException when shop code is invalid', async () => {
    // Arrange
    const mockContext = createMockContext({ 'x-shop-code': 'INVALID' });
    jest.spyOn(shopsService, 'validateShopCode')
      .mockRejectedValue(new UnauthorizedException());

    // Act & Assert
    await expect(guard.canActivate(mockContext))
      .rejects
      .toThrow(UnauthorizedException);
    
    expect(shopsService.validateShopCode).toHaveBeenCalledWith('INVALID');
  });
});
