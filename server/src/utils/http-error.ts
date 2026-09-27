export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }

  static badRequest(code: string, message: string, details?: unknown) {
    return new HttpError(400, code, message, details);
  }

  static notFound(message = 'Resource not found') {
    return new HttpError(404, 'NOT_FOUND', message);
  }
}
