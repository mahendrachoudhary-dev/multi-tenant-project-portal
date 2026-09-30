import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
const options = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64, options);
  return `scrypt:${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password, hash) {
  const [algorithm, salt, encoded] = hash.split(":");
  if (algorithm !== "scrypt" || !salt || !encoded) return false;
  const actual = await scrypt(password, salt, 64, options);
  const expected = Buffer.from(encoded, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
// Used for unknown users to avoid an immediate response revealing account existence.
export const dummyHash = await hashPassword(randomBytes(32).toString("hex"));
