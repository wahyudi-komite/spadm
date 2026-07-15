const LOCAL_FRONTEND = 'http://localhost:4200';

export function getAllowedOrigins(): string[] {
  const configured =
    process.env.CORS_ORIGINS || process.env.APP_URL || LOCAL_FRONTEND;
  return configured
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

export function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true;
  return getAllowedOrigins().includes(origin.replace(/\/$/, ''));
}
