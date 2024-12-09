import databaseConfig from './database.config';

describe('Database Config', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should be registered with database namespace', () => {
    expect(databaseConfig.KEY).toBe('CONFIGURATION(database)');
  });

  it('should use DATABASE_URL from environment', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    const config = databaseConfig();
    expect(config.url).toBe('postgresql://user:pass@localhost:5432/db');
  });

  describe('development environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should enable synchronize and logging in development', () => {
      const config = databaseConfig();
      expect(config.synchronize).toBe(true);
      expect(config.logging).toBe(true);
    });
  });

  describe('production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should disable synchronize and logging in production', () => {
      const config = databaseConfig();
      expect(config.synchronize).toBe(false);
      expect(config.logging).toBe(false);
    });
  });

  describe('static configuration', () => {
    it('should have correct static values', () => {
      const config = databaseConfig();
      
      expect(config.type).toBe('postgres');
      expect(config.entities).toEqual(['dist/**/*.entity{.ts,.js}']);
      expect(config.migrations).toEqual(['dist/migrations/*{.ts,.js}']);
      expect(config.migrationsTableName).toBe('migrations');
      expect(config.migrationsRun).toBe(true);
    });

    it('should have correct SSL configuration', () => {
      const config = databaseConfig();
      expect(config.ssl).toEqual({
        rejectUnauthorized: false,
      });
    });
  });
});
