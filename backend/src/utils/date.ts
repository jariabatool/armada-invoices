/** "2026-10-15" -> Date at 00:00 UTC (how Postgres DATE columns are read back). */
export const parseIsoDate = (isoDate: string): Date => new Date(`${isoDate}T00:00:00.000Z`);

/** Date -> "2026-10-15" (UTC calendar date). */
export const formatIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

/** Start of the current UTC day. */
export const startOfUtcDay = (now: Date = new Date()): Date =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
