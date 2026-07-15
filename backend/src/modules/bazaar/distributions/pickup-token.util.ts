import { BadRequestException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

export function signPickupToken(tokenCode: string, secret: string): string {
  const signature = createHmac('sha256', secret)
    .update(tokenCode)
    .digest('base64url');
  return `${tokenCode}.${signature}`;
}

export function verifyPickupToken(value: string, secret: string): string {
  const normalized = value.startsWith('SPADM:PICKUP:')
    ? value.slice('SPADM:PICKUP:'.length)
    : value;
  const separator = normalized.lastIndexOf('.');
  if (separator < 1) throw new BadRequestException('Format QR tidak valid');

  const tokenCode = normalized.slice(0, separator);
  const signature = normalized.slice(separator + 1);
  const expected = signPickupToken(tokenCode, secret).slice(separator + 1);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new BadRequestException('Signature QR tidak valid');
  }
  return tokenCode;
}
