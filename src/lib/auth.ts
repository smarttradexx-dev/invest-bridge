import { randomBytes } from "node:crypto";

import { cookies } from "next/headers";

import { queryOne, run } from "./db";
import { hashPassword, verifyPassword } from "./hash";
import type { AdminUser } from "./types";

export { hashPassword, verifyPassword };

export const ADMIN_COOKIE = "aurex_admin";
const SESSION_TTL_HOURS = 12;

/* ------------------------------ sessions ---------------------------- */

export function createSession(adminId: number): { token: string; expiresAt: Date } {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000);
  run(
    "INSERT INTO sessions (token, admin_id, expires_at) VALUES (?, ?, ?)",
    token,
    adminId,
    expiresAt.toISOString(),
  );
  return { token, expiresAt };
}

export function destroySession(token: string): void {
  run("DELETE FROM sessions WHERE token = ?", token);
}

export function getAdminByToken(token: string): AdminUser | undefined {
  const row = queryOne<AdminUser & { expires_at: string }>(
    `SELECT a.id, a.username, a.name, a.role, a.created_at, s.expires_at
       FROM sessions s
       JOIN admins a ON a.id = s.admin_id
      WHERE s.token = ?`,
    token,
  );
  if (!row) return undefined;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    destroySession(token);
    return undefined;
  }
  const { expires_at, ...admin } = row;
  void expires_at;
  return admin;
}

/** Resolve the currently signed-in admin from the request cookie. */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return getAdminByToken(token) ?? null;
}

export function authenticate(username: string, password: string): AdminUser | null {
  const admin = queryOne<AdminUser & { password_hash: string; salt: string }>(
    "SELECT * FROM admins WHERE username = ?",
    username,
  );
  if (!admin) return null;
  if (!verifyPassword(password, admin.salt, admin.password_hash)) return null;
  const { password_hash, salt, ...clean } = admin;
  void password_hash;
  void salt;
  return clean;
}

export { SESSION_TTL_HOURS };
