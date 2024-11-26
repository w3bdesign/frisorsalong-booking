import { ConfigService } from '@nestjs/config';
import { cacheConfig } from './cache.config';

describe('cacheConfig', () => {
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn(),
    } as any;
  });

  it('should return default values when no environment variables are set', () => {
    const config = cacheConfig(mockConfigService);
    expect(config).toEqual({
      host: 'localhost',
      port: 6379,
      ttl: 300,
    });
  });

  it('should use environment variables when provided', () => {
    const mockEnv = {
      CACHE_HOST: 'redis.example.com',
      CACHE_PORT: '6380',
      CACHE_TTL: '600',
    };

    (mockConfigService.get as jest.Mock).mockImplementation((key: string) => mockEnv[key]);

    const config = cacheConfig(mockConfigService);
    expect(config).toEqual({
      host: 'redis.example.com',
      port: 6380,
      ttl: 600,
    });
  });
});
