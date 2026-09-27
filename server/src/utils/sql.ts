import type { SQLInputValue } from 'node:sqlite';

export type SqlParam = SQLInputValue;

export interface SqlFragment {
  sql: string;
  params: SqlParam[];
}

export function placeholders(count: number): string {
  return Array.from({ length: count }, () => '?').join(', ');
}

/** Escapes LIKE wildcards; pair with `ESCAPE '\'`. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export function joinWhere(fragments: SqlFragment[]): SqlFragment {
  if (fragments.length === 0) return { sql: '', params: [] };
  return {
    sql: `WHERE ${fragments.map((f) => `(${f.sql})`).join(' AND ')}`,
    params: fragments.flatMap((f) => f.params),
  };
}
