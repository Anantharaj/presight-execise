export interface Migration {
  /** Monotonically increasing; stored in `PRAGMA user_version`. */
  version: number;
  name: string;
  up: string;
}
