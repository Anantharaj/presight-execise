import { z } from 'zod';
import {
  CLIENT_LOG_LEVELS,
  MAX_CLIENT_LOG_BATCH,
  MAX_CLIENT_LOG_MESSAGE,
  MAX_CLIENT_LOG_STACK,
} from '../constants';

export const clientLogEventSchema = z.object({
  level: z.enum(CLIENT_LOG_LEVELS),
  message: z.string().min(1).max(MAX_CLIENT_LOG_MESSAGE),
  timestamp: z.iso.datetime(),
  /** Page URL where the event happened. */
  url: z.string().max(2048),
  stack: z.string().max(MAX_CLIENT_LOG_STACK).optional(),
  /** Request id of a failed API call, to join client and server logs. */
  requestId: z.string().max(128).optional(),
  /** Small, flat key/value context. No personal data. */
  context: z
    .record(z.string().max(64), z.union([z.string().max(256), z.number(), z.boolean(), z.null()]))
    .refine((value) => Object.keys(value).length <= 20, 'Too many context keys')
    .optional(),
});

export const clientLogBatchSchema = z.object({
  events: z.array(clientLogEventSchema).min(1).max(MAX_CLIENT_LOG_BATCH),
});

export type ClientLogEvent = z.infer<typeof clientLogEventSchema>;
export type ClientLogBatch = z.infer<typeof clientLogBatchSchema>;
