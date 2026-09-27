import type { ClientLogBatch } from '@presight/shared';
import type { Logger } from '../config/logger';
import { getLogger } from '../logging/request-context';

export interface ClientLogMeta {
  userAgent?: string;
}

/** Writes browser-reported events into the server log stream, tagged `source: "client"`. */
export class ClientLogService {
  constructor(private readonly logger: Logger) {}

  record({ events }: ClientLogBatch, meta: ClientLogMeta): void {
    const log = getLogger(this.logger).child({ source: 'client', userAgent: meta.userAgent });
    for (const { level, message, ...fields } of events) {
      log[level](fields, message);
    }
  }
}
