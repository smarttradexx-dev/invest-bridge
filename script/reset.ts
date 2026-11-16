/**
 * Reset the AUREX Global database and re-seed it.
 *
 *   npm run db:reset
 *
 * Truncates every table (rather than deleting the file) so a running
 * server keeps working with the same database handle.
 */
import { ensureSeeded } from "../src/lib/bootstrap.ts";
import { getDb, run } from "../src/lib/db.ts";

const db = getDb();

db.exec("PRAGMA foreign_keys = OFF;");
for (const table of ["sessions", "orders", "batches", "stores", "admins", "settings"]) {
  run(`DELETE FROM ${table}`);
}
// Restart AUTOINCREMENT counters so ids begin at 1 again.
run("DELETE FROM sqlite_sequence");
db.exec("PRAGMA foreign_keys = ON;");

const result = ensureSeeded();
console.log("AUREX Global — database reset");
console.log("────────────────────────────");
console.log(result.message);
console.log("Admin credentials → username: admin | password: Aurex2026!");
