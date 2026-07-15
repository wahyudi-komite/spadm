import { BadRequestException } from '@nestjs/common';
import { signPickupToken, verifyPickupToken } from './pickup-token.util';

describe('pickup token utilities', () => {
  const secret = 'phase-8-test-secret';

  it('signs and verifies a pickup token', () => {
    const signed = signPickupToken('token-123', secret);

    expect(verifyPickupToken(signed, secret)).toBe('token-123');
  });

  it('accepts the prefixed QR format for backward compatibility', () => {
    const signed = signPickupToken('token-123', secret);

    expect(verifyPickupToken(`SPADM:PICKUP:${signed}`, secret)).toBe(
      'token-123',
    );
  });

  it('rejects a modified token or signature', () => {
    const signed = signPickupToken('token-123', secret);

    expect(() => verifyPickupToken(`${signed}x`, secret)).toThrow(
      BadRequestException,
    );
    expect(() => verifyPickupToken('invalid', secret)).toThrow(
      'Format QR tidak valid',
    );
  });

  it('rejects an empty or missing token', () => {
    expect(() => verifyPickupToken('', secret)).toThrow(
      'Format QR tidak valid',
    );
    expect(() =>
      verifyPickupToken(undefined as unknown as string, secret),
    ).toThrow('Format QR tidak valid');
  });
});
