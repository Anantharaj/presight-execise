import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import type { ApiErrorBody } from '@presight/shared';
import { HttpError } from '../utils/http-error';

/** Maps errors to the uniform JSON shape; unexpected errors are logged once, here, with the request id. */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = req.id === undefined ? undefined : String(req.id);
  let status = 500;
  let body: ApiErrorBody = {
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong', requestId },
  };

  if (err instanceof ZodError) {
    status = 400;
    body = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters',
        details: err.issues.map(({ path, message }) => ({ path: path.join('.'), message })),
        requestId,
      },
    };
  } else if (err instanceof HttpError) {
    status = err.status;
    body = { error: { code: err.code, message: err.message, details: err.details, requestId } };
  } else {
    req.log.error({ err }, 'Unhandled error');
  }

  res.status(status).json(body);
};
