import { getSetting, queryOne, run } from "./db";
import type { Batch } from "./types";

/**
 * Thursday shipment scheduling.
 *
 * Every order week has one consolidated shipment from Turkey. The cutoff is
 * Thursday 14:00 Turkish time (UTC+3) → 11:00 UTC, configurable through the
 * `cutoff_hour_utc` setting.
 */

export const TURKEY_UTC_OFFSET_HOURS = 3;

function cutoffHourUtc(): number {
  const raw = Number(getSetting("cutoff_hour_utc"));
  return Number.isFinite(raw) ? raw : 11;
}

/**
 * The next Thursday cutoff as a Date (UTC).
 * If "now" is before this week's Thursday cutoff, that cutoff is returned —
 * otherwise we roll forward to the following Thursday.
 */
export function getNextThursdayCutoff(now: Date = new Date()): Date {
  const hour = cutoffHourUtc();
  const utcDay = now.getUTCDay(); // 0 = Sunday … 4 = Thursday
  const daysUntilThursday = (4 - utcDay + 7) % 7;

  const candidate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, 0, 0),
  );
  candidate.setUTCDate(candidate.getUTCDate() + daysUntilThursday);

  // Already past this week's cutoff → next Thursday.
  if (candidate.getTime() <= now.getTime()) {
    candidate.setUTCDate(candidate.getUTCDate() + 7);
  }
  return candidate;
}

/** Ship date (the Thursday itself) for a given cutoff. */
export function getShipDate(cutoff: Date): Date {
  return new Date(
    Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth(), cutoff.getUTCDate()),
  );
}

/** ISO-8601 week number, used to build a human-readable batch code. */
export function isoWeekNumber(date: Date): number {
  const target = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstDayNumber = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNumber + 3);
  return 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 86400000));
}

export function buildBatchCode(shipDate: Date): string {
  const year = shipDate.getUTCFullYear();
  const week = isoWeekNumber(shipDate);
  return `AURX-${year}-W${String(week).padStart(2, "0")}`;
}

/**
 * Fetch (or lazily create) the batch for the upcoming Thursday shipment.
 * Orders that are paid are attached to this batch.
 */
export function getOrCreateCurrentBatch(now: Date = new Date()): Batch {
  const cutoff = getNextThursdayCutoff(now);
  const shipDate = getShipDate(cutoff);
  const code = buildBatchCode(shipDate);

  const existing = queryOne<Batch>(
    "SELECT * FROM batches WHERE code = ?",
    code,
  );
  if (existing) return existing;

  run(
    "INSERT OR IGNORE INTO batches (code, ship_date, cutoff_at, status) VALUES (?, ?, ?, 'open')",
    code,
    shipDate.toISOString().slice(0, 10),
    cutoff.toISOString(),
  );

  const created = queryOne<Batch>("SELECT * FROM batches WHERE code = ?", code);
  if (!created) throw new Error("Failed to create shipment batch");
  return created;
}

/** Milliseconds remaining until the cutoff (never negative). */
export function millisUntilCutoff(now: Date = new Date()): number {
  return Math.max(0, getNextThursdayCutoff(now).getTime() - now.getTime());
}
