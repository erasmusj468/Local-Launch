import { createHmac, randomBytes, pbkdf2Sync, timingSafeEqual } from "crypto";

const SESSION_COOKIE = "ll_session";
const ITERATIONS = 120000;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256").toString("hex");
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

function secret() {
  return process.env.AUTH_SECRET || "local-launch-development-secret";
}

export function createSession(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readSession(token?: string | null) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.exp > Date.now() ? data.userId as string : null;
  } catch { return null; }
}

export const sessionCookie = SESSION_COOKIE;
