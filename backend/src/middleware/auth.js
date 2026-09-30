import Session from "../models/Session.js";
import { cookieName, digest } from "../utils/session.js";
import { ApiError } from "../utils/errors.js";

export async function authenticate(req, res, next) {
  const token = req.cookies[cookieName];
  if (!token || !/^[a-f0-9]{64}$/.test(token))
    throw new ApiError(401, "Please sign in.");
  const session = await Session.findOne({
    tokenHash: digest(token),
    expiresAt: { $gt: new Date() },
  }).populate("user");
  if (!session?.user)
    throw new ApiError(401, "Your session has expired. Please sign in.");
  req.user = session.user;
  next();
}
