import mongoose from "mongoose";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { notFound } from "../utils/errors.js";

export const projectFilter = (req) => ({
  _id: req.params.projectId,
  organization: req.organizationId,
});

export async function loadProject(req, res, next) {
  req.project = await Project.findOne(projectFilter(req));
  if (!req.project) throw notFound();
  next();
}

export async function listProjects(req, res) {
  const projects = await Project.find({ organization: req.organizationId })
    .sort({ createdAt: -1 })
    .populate("creator", "name");
  res.json({ projects });
}

export async function createProject(req, res) {
  const project = await Project.create({
    ...req.input,
    organization: req.organizationId,
    creator: req.user._id,
  });
  res.status(201).json({ project });
}

export const getProject = (req, res) => res.json({ project: req.project });
export async function updateProject(req, res) {
  const project = await Project.findOneAndUpdate(
    projectFilter(req),
    { $set: req.input },
    { new: true, runValidators: true },
  );
  if (!project) throw notFound();
  res.json({ project });
}

export async function deleteProject(req, res) {
  await mongoose.connection.transaction(async (session) => {
    const project = await Project.findOneAndDelete(projectFilter(req), {
      session,
    });
    if (!project) throw notFound();
    await Task.deleteMany(
      { project: project._id, organization: req.organizationId },
      { session },
    );
  });
  res.status(204).end();
}
