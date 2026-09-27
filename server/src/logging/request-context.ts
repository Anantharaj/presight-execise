import { AsyncLocalStorage } from 'node:async_hooks';
import type { Logger } from '../config/logger';

export interface RequestContext {
  requestId: string;
  logger: Logger;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

/** The current request's logger (carries `reqId`), or `fallback` outside a request. */
export function getLogger(fallback: Logger): Logger {
  return requestContext.getStore()?.logger ?? fallback;
}

export function getRequestId(): string | undefined {
  return requestContext.getStore()?.requestId;
}
