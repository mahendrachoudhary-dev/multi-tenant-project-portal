import { createHash, randomBytes } from "node:crypto";
import Session from "../models/Session.js";
import { env } from "../config/env.js";
export const cookieName =
  env.NODE_ENV === "production" ? "__Host-portal_session" : "portal_session";
export const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};
export const digest = (token) =>
  createHash("sha256").update(token).digest("hex");
export async function createSession(user, req, res) {
  const previous = req.cookies[cookieName];
  if (previous) await Session.deleteOne({ tokenHash: digest(previous) });
  const token = randomBytes(32).toString("hex");
  const maxAge = env.SESSION_DAYS * 86400000;
  await Session.create({
    user,
    tokenHash: digest(token),
    expiresAt: new Date(Date.now() + maxAge),
  });
  res.cookie(cookieName, token, { ...cookieOptions, maxAge });
}
export const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
});
