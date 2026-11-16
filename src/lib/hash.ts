import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Password hashing helpers.
 *
 * Kept free of any Next.js imports so the seed script can run as a plain
 * Node process (`node scripts/seed.ts`).
 */

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt ?? randomBytes(16).toString("hex");
  const hash = scryptSync(password, usedSalt, 64).toString("hex");
  return { hash, salt: usedSalt };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
