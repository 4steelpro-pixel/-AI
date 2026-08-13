import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_TTL = process.env.JWT_TTL || "7d";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  fullName?: string | null;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_TTL as jwt.SignOptions["expiresIn"] });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, JWT_SECRET) as { sub: string; role?: string };
}

export function createOtpCode() {
  return crypto.randomInt(100000, 999999).toString();
}

export function createSessionToken() {
  return crypto.randomBytes(24).toString("hex");
}
