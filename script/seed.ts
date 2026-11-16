/**
 * Seed the AUREX Global database.
 *
 *   npm run seed
 *
 * Creates `data/aurex.db` with the schema, the default admin account,
 * the five flagship stores and a set of sample orders.
 */
import { ensureSeeded } from "../src/lib/bootstrap.ts";

const result = ensureSeeded();
console.log("AUREX Global — database seed");
console.log("────────────────────────────");
console.log(result.message);
console.log("Admin credentials → username: admin | password: Aurex2026!");
