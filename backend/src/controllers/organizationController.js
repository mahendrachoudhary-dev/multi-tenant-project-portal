import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import Membership from "../models/Membership.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { ApiError, notFound } from "../utils/errors.js";

export async function listOrganizations(req, res) {
  const memberships = await Membership.find({ user: req.user._id })
    .populate("organization")
    .sort({ createdAt: 1 });
  res.json({
    organizations: memberships
      .filter((m) => m.organization)
      .map((m) => ({ ...m.organization.toObject(), role: m.role })),
  });
}

export async function createOrganization(req, res) {
  let organization;
  await mongoose.connection.transaction(async (session) => {
    [organization] = await Organization.create(
      [{ ...req.input, creator: req.user._id }],
      { session },
    );
    await Membership.create(
      [{ organization: organization._id, user: req.user._id, role: "OWNER" }],
      { session },
    );
  });
  res
    .status(201)
    .json({ organization: { ...organization.toObject(), role: "OWNER" } });
}

export async function getOrganization(req, res) {
  const organization = await Organization.findById(req.organizationId);
  if (!organization) throw notFound();
  res.json({
    organization: { ...organization.toObject(), role: req.membership.role },
  });
}

export async function listMembers(req, res) {
  const members = await Membership.find({ organization: req.organizationId })
    .populate("user", "name email")
    .sort({ createdAt: 1 });
  res.json({ members });
}

export async function addMember(req, res) {
  if (req.input.role === "ADMIN" && req.membership.role !== "OWNER")
    throw new ApiError(403, "Only owners can add admins.");
  const user = await User.findOne({ email: req.input.email });
  if (!user)
    throw new ApiError(404, "This person must register before being added.");
  const member = await Membership.create({
    user: user._id,
    organization: req.organizationId,
    role: req.input.role,
  });
  res.status(201).json({ member });
}

export async function stats(req, res) {
  const filter = { organization: req.organizationId };
  const [projects, members, total, done, inProgress, high] = await Promise.all([
    Project.countDocuments(filter),
    Membership.countDocuments(filter),
    Task.countDocuments(filter),
    Task.countDocuments({ ...filter, status: "DONE" }),
    Task.countDocuments({ ...filter, status: "IN_PROGRESS" }),
    Task.countDocuments({
      ...filter,
      status: { $ne: "DONE" },
      priority: "HIGH",
    }),
  ]);
  res.json({
    stats: {
      projects,
      members,
      total,
      done,
      inProgress,
      high,
      todo: total - done - inProgress,
    },
  });
}
