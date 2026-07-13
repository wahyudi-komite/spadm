const requiredVariables = [
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_DATABASE',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'PICKUP_TOKEN_SECRET',
] as const;

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const missing = requiredVariables.filter((key) => {
    const value = config[key];
    return typeof value !== 'string' || value.trim().length === 0;
  });

  if (missing.length > 0) {
    throw new Error(`Environment variable wajib belum diisi: ${missing.join(', ')}`);
  }

  const port = Number(config.DB_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT harus berupa port yang valid');
  }

  if (
    config.NODE_ENV === 'production' &&
    String(config.COOKIE_SECURE).toLowerCase() !== 'true'
  ) {
    throw new Error('COOKIE_SECURE harus true pada production');
  }

  return config;
}
