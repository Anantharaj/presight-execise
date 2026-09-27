import { z } from 'zod';
import { SORT_FIELDS, SORT_ORDERS, type SortField, type SortOrder } from '@presight/shared';
import { HttpError } from './http-error';

const cursorSchema = z.object({
  sortBy: z.enum(SORT_FIELDS),
  sortOrder: z.enum(SORT_ORDERS),
  value: z.union([z.string(), z.number()]),
  id: z.number().int(),
});

/** Keyset position: the sort value and id of the last row on the previous page. */
export type Cursor = z.infer<typeof cursorSchema>;

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

/** Decodes a cursor and verifies it was issued for the same sort, otherwise pages would skip rows. */
export function decodeCursor(raw: string, sortBy: SortField, sortOrder: SortOrder): Cursor {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  } catch {
    throw HttpError.badRequest('INVALID_CURSOR', 'Cursor is malformed');
  }

  const result = cursorSchema.safeParse(parsed);
  if (!result.success) throw HttpError.badRequest('INVALID_CURSOR', 'Cursor is malformed');
  if (result.data.sortBy !== sortBy || result.data.sortOrder !== sortOrder) {
    throw HttpError.badRequest('INVALID_CURSOR', 'Cursor does not match the requested sort');
  }
  return result.data;
}
