import fs from "node:fs";
import path from "node:path";
import { DatabaseSync, type StatementSync } from "node:sqlite";

/**
 * AUREX Global data layer.
 *
 * Uses Node's built-in `node:sqlite` driver (Node 22+) so the application has
 * zero native build steps. The database file lives in `data/` and is created
 * and seeded automatically on first run.
 */

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.AUREX_DB_PATH ?? path.join(DB_DIR, "aurex.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS stores (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  name_ar     TEXT,
  name_tr     TEXT,
  domain      TEXT NOT NULL,
  url         TEXT NOT NULL,
  logo        TEXT NOT NULL DEFAULT 'generic',
  accent      TEXT NOT NULL DEFAULT '#D4AF37',
  tagline     TEXT NOT NULL DEFAULT '',
  tagline_ar  TEXT,
  tagline_tr  TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS batches (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT NOT NULL UNIQUE,
  ship_date   TEXT NOT NULL,
  cutoff_at   TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  order_code      TEXT NOT NULL UNIQUE,
  product_url     TEXT NOT NULL,
  store_slug      TEXT,
  product_title   TEXT,
  product_image   TEXT,
  product_price   REAL,
  size            TEXT,
  color           TEXT,
  quantity        INTEGER NOT NULL DEFAULT 1,
  customer_name   TEXT NOT NULL,
  phone           TEXT NOT NULL,
  phone_normalized TEXT NOT NULL,
  city            TEXT NOT NULL,
  address         TEXT,
  notes           TEXT,
  lang            TEXT NOT NULL DEFAULT 'ar',
  status          TEXT NOT NULL DEFAULT 'pending_quote',
  product_cost    REAL,
  shipping_cost   REAL,
  service_fee     REAL,
  net_profit      REAL,
  final_price     REAL,
  batch_id        INTEGER REFERENCES batches(id) ON DELETE SET NULL,
  quote_sent_at   TEXT,
  paid_at         TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt          TEXT NOT NULL,
  name          TEXT NOT NULL DEFAULT 'Concierge Admin',
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  admin_id   INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_batch  ON orders(batch_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone   ON orders(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_orders_code    ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stores_active ON stores(is_active, sort_order);
`;

declare global {
  var __aurexDb: DatabaseSync | undefined;
}

function createConnection(): DatabaseSync {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const database = new DatabaseSync(DB_PATH);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(SCHEMA);
  return database;
}

/** Lazily-created singleton connection (survives Next.js dev hot-reloads). */
export function getDb(): DatabaseSync {
  if (!globalThis.__aurexDb) {
    globalThis.__aurexDb = createConnection();
  }
  return globalThis.__aurexDb;
}

/**
 * `node:sqlite` returns rows with a null prototype, which React refuses to
 * serialise when passing data from Server to Client Components. Every row is
 * therefore copied into a plain object.
 */
function plain<T>(row: unknown): T {
  return { ...(row as object) } as T;
}

export function queryAll<T = Record<string, unknown>>(
  sql: string,
  ...params: unknown[]
): T[] {
  const statement = getDb().prepare(sql);
  return (statement.all(...(params as never[])) as unknown[]).map((row) => plain<T>(row));
}

export function queryOne<T = Record<string, unknown>>(
  sql: string,
  ...params: unknown[]
): T | undefined {
  const statement = getDb().prepare(sql);
  const row = statement.get(...(params as never[]));
  return row === undefined ? undefined : plain<T>(row);
}

export function run(
  sql: string,
  ...params: unknown[]
): { changes: number; lastInsertRowid: number } {
  const statement: StatementSync = getDb().prepare(sql);
  const result = statement.run(...(params as never[]));
  return {
    changes: Number(result.changes),
    lastInsertRowid: Number(result.lastInsertRowid),
  };
}

export function transaction<T>(fn: () => T): T {
  const db = getDb();
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * Settings helpers
 * ------------------------------------------------------------------ */

export const DEFAULT_SETTINGS = {
  service_fee_percent: "12",
  default_shipping_cost: "8.50",
  cutoff_hour_utc: "11", // 14:00 Turkey time (UTC+3)
  contact_whatsapp: "905000000000",
  contact_email: "concierge@aurex.global",
} as const;

export function getSettings(): Record<string, string> {
  const rows = queryAll<{ key: string; value: string }>("SELECT key, value FROM settings");
  const map: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) map[row.key] = row.value;
  return map;
}

export function getSetting(key: keyof typeof DEFAULT_SETTINGS): string {
  return getSettings()[key] ?? DEFAULT_SETTINGS[key];
}

export function setSetting(key: string, value: string): void {
  run(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    key,
    value,
  );
}

export { DB_PATH };
