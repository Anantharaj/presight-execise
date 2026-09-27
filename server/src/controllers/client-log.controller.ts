import type { Request, Response } from 'express';
import { clientLogBatchSchema } from '@presight/shared';
import type { ClientLogService } from '../services/client-log.service';

export class ClientLogController {
  constructor(private readonly clientLogService: ClientLogService) {}

  ingest = (req: Request, res: Response) => {
    const batch = clientLogBatchSchema.parse(req.body);
    this.clientLogService.record(batch, { userAgent: req.get('user-agent') });
    res.status(204).end();
  };
}
