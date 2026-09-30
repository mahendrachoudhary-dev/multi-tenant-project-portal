import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";
import { authenticate } from "../middleware/auth.js";
import { requireMembership, requireManager } from "../middleware/tenant.js";
import {
  validate,
  schemas,
  patch,
  validateIds,
} from "../middleware/validate.js";
import * as auth from "../controllers/authController.js";
import * as org from "../controllers/organizationController.js";
import * as projects from "../controllers/projectController.js";
import * as tasks from "../controllers/taskController.js";

export const router = Router();

const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
  message: { message: "Too many attempts. Please try again in 15 minutes." },
});

router.post(
  "/auth/register",
  authLimit,
  validate(schemas.register),
  auth.register,
);

router.post("/auth/login", authLimit, validate(schemas.login), auth.login);
router.post("/auth/logout", auth.logout);
router.use(authenticate);
router.get("/auth/me", auth.me);
router.get("/organizations", org.listOrganizations);
router.post(
  "/organizations",
  validate(schemas.organization),
  org.createOrganization,
);

const scoped = Router({ mergeParams: true });
router.use("/organizations/:organizationId", requireMembership, scoped);

scoped.get("/", org.getOrganization);
scoped.get("/members", org.listMembers);
scoped.post(
  "/members",
  requireManager,
  validate(schemas.member),
  org.addMember,
);
scoped.get("/stats", org.stats);
scoped.get("/projects", projects.listProjects);
scoped.post(
  "/projects",
  requireManager,
  validate(schemas.project),
  projects.createProject,
);
scoped.get(
  "/projects/:projectId",
  validateIds,
  projects.loadProject,
  projects.getProject,
);
scoped.patch(
  "/projects/:projectId",
  validateIds,
  requireManager,
  validate(patch(schemas.project)),
  projects.updateProject,
);
scoped.delete(
  "/projects/:projectId",
  validateIds,
  requireManager,
  projects.deleteProject,
);

const taskRouter = Router({ mergeParams: true });
scoped.use(
  "/projects/:projectId/tasks",
  validateIds,
  projects.loadProject,
  taskRouter,
);

taskRouter.get("/", tasks.listTasks);
taskRouter.post("/", validate(schemas.task), tasks.createTask);
taskRouter.patch(
  "/:taskId",
  validateIds,
  validate(patch(schemas.task)),
  tasks.updateTask,
);
taskRouter.delete("/:taskId", validateIds, tasks.deleteTask);
