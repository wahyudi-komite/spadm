import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Terjadi kesalahan internal server';
    let code: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const exceptionBody = exceptionResponse as Record<string, unknown>;
        if (
          typeof exceptionBody.message === 'string' ||
          (Array.isArray(exceptionBody.message) &&
            exceptionBody.message.every((item) => typeof item === 'string'))
        ) {
          message = exceptionBody.message;
        } else {
          message = exception.message;
        }
        if (typeof exceptionBody.code === 'string') {
          code = exceptionBody.code;
        }
      }
    }

    if (!(exception instanceof HttpException) || status >= 500) {
      const context = `${request.method} ${request.originalUrl || request.url}`;
      const details =
        exception instanceof Error ? exception.stack : String(exception);
      this.logger.error(`Unhandled HTTP error [${status}] ${context}`, details);
    }

    response.status(status).json({
      success: false,
      message,
      code,
      errors: null,
    });
  }
}
