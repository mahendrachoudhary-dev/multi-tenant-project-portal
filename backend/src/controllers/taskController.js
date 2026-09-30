import mongoose from "mongoose";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Membership from "../models/Membership.js";
import { projectFilter } from "./projectController.js";
import { ApiError, notFound } from "../utils/errors.js";

const filter = (req) => ({
  _id: req.params.taskId,
  project: req.params.projectId,
  organization: req.organizationId,
});

async function guardWrite(req, session) {
  const result = await Project.updateOne(
    projectFilter(req),
    { $inc: { revision: 1 } },
    { session },
  );
  if (!result.matchedCount) throw notFound();
  if (
    req.input?.assignee &&
    !(await Membership.exists({
      user: req.input.assignee,
      organization: req.organizationId,
    }).session(session))
  ) {
    throw new ApiError(400, "Assignee must belong to this organization.");
  }
}

export async function listTasks(req, res) {
  const tasks = await Task.find({
    organization: req.organizationId,
    project: req.params.projectId,
  })
    .populate("assignee", "name email")
    .populate("creator", "name")
    .sort({ createdAt: -1 });
  res.json({ tasks });
}

export async function createTask(req, res) {
  let task;
  await mongoose.connection.transaction(async (session) => {
    await guardWrite(req, session);
    [task] = await Task.create(
      [
        {
          ...req.input,
          project: req.params.projectId,
          organization: req.organizationId,
          creator: req.user._id,
        },
      ],
      { session },
    );
  });
  res.status(201).json({ task });
}

export async function updateTask(req, res) {
  let task;
  await mongoose.connection.transaction(async (session) => {
    await guardWrite(req, session);
    task = await Task.findOneAndUpdate(
      filter(req),
      { $set: req.input },
      { session, new: true, runValidators: true },
    );
    if (!task) throw notFound();
  });
  res.json({ task });
}

export async function deleteTask(req, res) {
  await mongoose.connection.transaction(async (session) => {
    await guardWrite(req, session);
    if (!(await Task.findOneAndDelete(filter(req), { session })))
      throw notFound();
  });
  res.status(204).end();
}
