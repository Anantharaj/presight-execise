import { z } from 'zod';

const booleanString = z
  .enum(['true', 'false'])
  .default('true')
  .transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DB_PATH: z.string().min(1).default('data/presight.db'),
  SEED_ON_START: booleanString,
  SEED_USER_COUNT: z.coerce.number().int().positive().max(1_000_000).default(10_000),
  SEED_RANDOM_SEED: z.coerce.number().int().default(42),
  SLOW_QUERY_MS: z.coerce.number().int().nonnegative().default(200),
  CLIENT_LOGS_PER_MINUTE: z.coerce.number().int().positive().default(60),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
