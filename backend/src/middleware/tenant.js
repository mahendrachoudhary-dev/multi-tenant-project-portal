import mongoose from "mongoose";
import Membership from "../models/Membership.js";
import { ApiError, notFound } from "../utils/errors.js";

export async function requireMembership(req, res, next) {
  const { organizationId } = req.params;
  if (!mongoose.isObjectIdOrHexString(organizationId))
    throw new ApiError(400, "Invalid organization ID.");
  req.membership = await Membership.findOne({
    organization: organizationId,
    user: req.user._id,
  });
  // Same answer for nonexistent organizations and organizations the user cannot see.
  if (!req.membership) throw notFound();
  req.organizationId = organizationId;
  next();
}
export function requireManager(req, res, next) {
  if (!["OWNER", "ADMIN"].includes(req.membership.role))
    throw new ApiError(403, "An owner or admin role is required.");
  next();
}
