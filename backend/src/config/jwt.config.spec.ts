import jwtConfig from './jwt.config';

describe('JWT Config', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should be registered with jwt namespace', () => {
    // registerAs adds a KEY property in the format "CONFIGURATION(namespace)"
    expect(jwtConfig.KEY).toBe('CONFIGURATION(jwt)');
  });

  it('should use JWT_SECRET from environment', () => {
    process.env.JWT_SECRET = 'test-secret';
    const config = jwtConfig();
    expect(config.secret).toBe('test-secret');
  });

  it('should use JWT_EXPIRATION from environment', () => {
    process.env.JWT_EXPIRATION = '2h';
    const config = jwtConfig();
    expect(config.signOptions.expiresIn).toBe('2h');
  });

  it('should use default expiration when JWT_EXPIRATION is not set', () => {
    delete process.env.JWT_EXPIRATION;
    const config = jwtConfig();
    expect(config.signOptions.expiresIn).toBe('1h');
  });

  it('should return undefined secret when JWT_SECRET is not set', () => {
    delete process.env.JWT_SECRET;
    const config = jwtConfig();
    expect(config.secret).toBeUndefined();
  });
});
