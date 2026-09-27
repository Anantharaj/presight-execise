import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import type { ApiErrorBody } from '@presight/shared';
import type { Logger } from '../config/logger';
import { HttpError } from '../utils/http-error';

export function errorHandler(logger: Logger): ErrorRequestHandler {
  return (err, _req, res, _next) => {
    let status = 500;
    let body: ApiErrorBody = {
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
    };

    if (err instanceof ZodError) {
      status = 400;
      body = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          details: err.issues.map(({ path, message }) => ({ path: path.join('.'), message })),
        },
      };
    } else if (err instanceof HttpError) {
      status = err.status;
      body = { error: { code: err.code, message: err.message, details: err.details } };
    } else {
      logger.error({ err }, 'Unhandled error');
    }

    res.status(status).json(body);
  };
}
