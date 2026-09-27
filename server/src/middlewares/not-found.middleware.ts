import type { RequestHandler } from 'express';
import { HttpError } from '../utils/http-error';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(HttpError.notFound(`Route ${req.method} ${req.path} not found`));
};
