import { ArgumentsHost, BadRequestException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AllExceptionsFilter } from './http-exception.filter';

describe('AllExceptionsFilter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createHost = () => {
    const status = jest.fn();
    const json = jest.fn();
    status.mockReturnValue({ json });
    const request = {
      method: 'GET',
      originalUrl: '/api/example',
      url: '/api/example',
    } as Request;
    const response = { status } as unknown as Response;
    const host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as ArgumentsHost;
    return { host, status, json };
  };

  it('logs an unexpected error with HTTP context and returns a safe response', () => {
    const logger = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const { host, status, json } = createHost();

    new AllExceptionsFilter().catch(new Error('database unavailable'), host);

    expect(logger).toHaveBeenCalledWith(
      'Unhandled HTTP error [500] GET /api/example',
      expect.stringContaining('database unavailable'),
    );
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'Terjadi kesalahan internal server',
      code: undefined,
      errors: null,
    });
  });

  it('does not log expected client errors as server failures', () => {
    const logger = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const { host, status } = createHost();

    new AllExceptionsFilter().catch(
      new BadRequestException('Permintaan tidak valid'),
      host,
    );

    expect(logger).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(400);
  });
});
