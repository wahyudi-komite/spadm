import { validateEnvironment } from './environment.validation';

const baseConfig = {
  NODE_ENV: 'production',
  APP_URL: 'https://spadm.example.com',
  DB_HOST: 'localhost',
  DB_PORT: '3306',
  DB_USERNAME: 'spadm',
  DB_PASSWORD: 'database-password',
  DB_DATABASE: 'spadm',
  DB_POOL_SIZE: '10',
  JWT_ACCESS_SECRET: 'access-secret-with-more-than-32-characters',
  JWT_REFRESH_SECRET: 'refresh-secret-with-more-than-32-characters',
  PICKUP_TOKEN_SECRET: 'pickup-secret-with-more-than-32-characters',
  COOKIE_SECURE: 'true',
};

describe('validateEnvironment', () => {
  it('accepts a secure production configuration', () => {
    expect(validateEnvironment({ ...baseConfig })).toMatchObject(baseConfig);
  });

  it('rejects weak production secrets', () => {
    expect(() =>
      validateEnvironment({
        ...baseConfig,
        JWT_ACCESS_SECRET: 'short',
      }),
    ).toThrow('Secret production minimal 32 karakter');
  });

  it('rejects non-HTTPS production origins', () => {
    expect(() =>
      validateEnvironment({
        ...baseConfig,
        APP_URL: 'http://spadm.example.com',
      }),
    ).toThrow('harus menggunakan HTTPS');
  });

  it('rejects an invalid database pool size', () => {
    expect(() =>
      validateEnvironment({
        ...baseConfig,
        DB_POOL_SIZE: '0',
      }),
    ).toThrow('DB_POOL_SIZE');
  });
});
