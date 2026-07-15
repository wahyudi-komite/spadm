const requiredVariables = [
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_DATABASE',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'PICKUP_TOKEN_SECRET',
] as const;

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const missing = requiredVariables.filter((key) => {
    const value = config[key];
    return typeof value !== 'string' || value.trim().length === 0;
  });

  if (missing.length > 0) {
    throw new Error(
      `Environment variable wajib belum diisi: ${missing.join(', ')}`,
    );
  }

  const port = Number(config.DB_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT harus berupa port yang valid');
  }

  const poolSize = Number(config.DB_POOL_SIZE || 10);
  if (!Number.isInteger(poolSize) || poolSize < 1 || poolSize > 100) {
    throw new Error('DB_POOL_SIZE harus berupa angka 1 sampai 100');
  }

  const trustProxyHops = Number(config.TRUST_PROXY_HOPS || 1);
  if (
    !Number.isInteger(trustProxyHops) ||
    trustProxyHops < 0 ||
    trustProxyHops > 10
  ) {
    throw new Error('TRUST_PROXY_HOPS harus berupa angka 0 sampai 10');
  }

  if (config.NODE_ENV === 'production') {
    if (String(config.COOKIE_SECURE).toLowerCase() !== 'true') {
      throw new Error('COOKIE_SECURE harus true pada production');
    }
    if (!stringValue(config.DB_PASSWORD).trim()) {
      throw new Error('DB_PASSWORD wajib diisi pada production');
    }

    const secrets = [
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
      'PICKUP_TOKEN_SECRET',
    ] as const;
    const weakSecrets = secrets.filter(
      (key) => stringValue(config[key]).length < 32,
    );
    if (weakSecrets.length > 0) {
      throw new Error(
        `Secret production minimal 32 karakter: ${weakSecrets.join(', ')}`,
      );
    }
    if (config.JWT_ACCESS_SECRET === config.JWT_REFRESH_SECRET) {
      throw new Error('JWT_ACCESS_SECRET dan JWT_REFRESH_SECRET harus berbeda');
    }

    const origins = (
      stringValue(config.CORS_ORIGINS) || stringValue(config.APP_URL)
    )
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
    if (
      origins.length === 0 ||
      origins.some((origin) => !origin.startsWith('https://'))
    ) {
      throw new Error(
        'CORS_ORIGINS atau APP_URL production harus menggunakan HTTPS',
      );
    }
  }

  return config;
}
