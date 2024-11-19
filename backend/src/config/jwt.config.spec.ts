import jwtConfig from './jwt.config';

describe('JWT Configuration', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should use environment variables when provided', () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRATION = '2h';

    const config = jwtConfig();

    expect(config).toEqual({
      secret: 'test-secret',
      signOptions: {
        expiresIn: '2h',
      },
    });
  });

  it('should use default expiration when JWT_EXPIRATION is not provided', () => {
    process.env.JWT_SECRET = 'test-secret';
    delete process.env.JWT_EXPIRATION;

    const config = jwtConfig();

    expect(config).toEqual({
      secret: 'test-secret',
      signOptions: {
        expiresIn: '1h',
      },
    });
  });

  it('should return undefined secret when JWT_SECRET is not provided', () => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRATION;

    const config = jwtConfig();

    expect(config).toEqual({
      secret: undefined,
      signOptions: {
        expiresIn: '1h',
      },
    });
  });
});
