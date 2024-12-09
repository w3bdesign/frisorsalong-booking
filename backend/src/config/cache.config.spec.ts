import cacheConfig from './cache.config';

describe('Cache Config', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should be registered with cache namespace', () => {
    expect(cacheConfig.KEY).toBe('CONFIGURATION(cache)');
  });

  describe('default values', () => {
    it('should use default values when environment variables are not set', () => {
      delete process.env.REDIS_HOST;
      delete process.env.REDIS_PORT;
      delete process.env.CACHE_TTL;

      const config = cacheConfig();

      expect(config.host).toBe('localhost');
      expect(config.port).toBe(6379);
      expect(config.ttl).toBe(300); // 5 minutes = 300 seconds
    });
  });

  describe('environment variables', () => {
    it('should use REDIS_HOST from environment', () => {
      process.env.REDIS_HOST = 'redis.example.com';
      const config = cacheConfig();
      expect(config.host).toBe('redis.example.com');
    });

    it('should use REDIS_PORT from environment', () => {
      process.env.REDIS_PORT = '6380';
      const config = cacheConfig();
      expect(config.port).toBe(6380);
    });

    it('should use CACHE_TTL from environment', () => {
      process.env.CACHE_TTL = '600';
      const config = cacheConfig();
      expect(config.ttl).toBe(600);
    });

    it('should handle invalid REDIS_PORT value', () => {
      process.env.REDIS_PORT = 'invalid';
      const config = cacheConfig();
      expect(config.port).toBe(6379); // Should fall back to default
    });

    it('should handle invalid CACHE_TTL value', () => {
      process.env.CACHE_TTL = 'invalid';
      const config = cacheConfig();
      expect(config.ttl).toBe(300); // Should fall back to default
    });
  });
});
