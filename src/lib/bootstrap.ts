import { getDb } from "./db";
import { seedIfEmpty } from "./seed";

/**
 * Bootstraps the database on first access.
 * Creates the schema, then fills empty tables with demo content.
 *
 * The check runs once per process — subsequent requests reuse the existing
 * data without re-querying the seed tables.
 */
let ensured = false;

export function ensureSeeded() {
  getDb();
  if (ensured) return { seeded: false, admin: false, stores: 0, orders: 0, message: "Already seeded." };

  const result = seedIfEmpty();
  ensured = true;
  return result;
}
