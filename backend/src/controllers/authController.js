import User from "../models/User.js";
import Session from "../models/Session.js";
import { hashPassword, verifyPassword, dummyHash } from "../utils/password.js";
import {
  createSession,
  publicUser,
  cookieName,
  cookieOptions,
  digest,
} from "../utils/session.js";
import { ApiError } from "../utils/errors.js";

export async function register(req, res) {
  const { name, email, password } = req.input;
  const user = await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
  });
  await createSession(user._id, req, res);
  res.status(201).json({ user: publicUser(user) });
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.input.email }).select(
    "+passwordHash",
  );
  const valid = await verifyPassword(
    req.input.password,
    user?.passwordHash || dummyHash,
  );
  if (!user || !valid) throw new ApiError(401, "Incorrect email or password.");
  await createSession(user._id, req, res);
  res.json({ user: publicUser(user) });
}

export async function logout(req, res) {
  const token = req.cookies[cookieName];
  if (token) await Session.deleteOne({ tokenHash: digest(token) });
  res.clearCookie(cookieName, cookieOptions).status(204).end();
}

export const me = (req, res) => res.json({ user: publicUser(req.user) });
