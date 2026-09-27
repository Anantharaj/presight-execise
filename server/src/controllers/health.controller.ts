import type { Request, Response } from 'express';
import type { HealthResponse } from '@presight/shared';
import type { Database } from '../db/connection';

export class HealthController {
  constructor(private readonly db: Database) {}

  check = (_req: Request, res: Response<HealthResponse>) => {
    this.db.prepare('SELECT 1').get();
    res.json({ status: 'ok', uptime: Math.round(process.uptime()) });
  };
}
