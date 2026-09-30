import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Membership from "../models/Membership.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { hashPassword } from "../utils/password.js";
import { z } from "zod";

// Safe to re-run: fixed IDs and $setOnInsert preserve existing edits/passwords.
// This script never drops a database or deletes user data.
const oid = (n) =>
  new mongoose.Types.ObjectId(n.toString(16).padStart(24, "0"));

try {
  const password = z.string().min(12).max(128).parse(process.env.DEMO_PASSWORD);
  await connectDB();
  await Promise.all(
    [User, Organization, Membership, Project, Task].map((m) => m.init()),
  );
  const passwordHash = await hashPassword(password);
  await mongoose.connection.transaction(async (session) => {
    const users = [];
    for (const [name, email] of [
      ["Demo Owner", "demo@portal.test"],
      ["Aarav Sharma", "member@portal.test"],
      ["Beta Reviewer", "beta@portal.test"],
    ]) {
      users.push(
        await User.findOneAndUpdate(
          { email },
          { $setOnInsert: { name, email, passwordHash } },
          { upsert: true, new: true, session },
        ),
      );
    }
    const organizations = [
      {
        _id: oid(101),
        name: "Acme Inc.",
        description:
          "Organization for website and application development projects.",
        creator: users[0]._id,
      },
      {
        _id: oid(102),
        name: "Beta Labs",
        description: "A separate organization with its own projects and members.",
        creator: users[2]._id,
      },
    ];
    for (const org of organizations)
      await Organization.updateOne(
        { _id: org._id },
        { $setOnInsert: org },
        { upsert: true, session },
      );
    for (const [org, user, role] of [
      [101, users[0], "OWNER"],
      [101, users[1], "MEMBER"],
      [102, users[2], "OWNER"],
      [102, users[0], "MEMBER"],
    ]) {
      await Membership.updateOne(
        { organization: oid(org), user: user._id },
        { $setOnInsert: { role } },
        { upsert: true, session },
      );
    }
    const projects = [
      {
        _id: oid(201),
        organization: oid(101),
        name: "Website Redesign",
        description:
          "Redesign the company website and improve its responsive layout.",
        creator: users[0]._id,
      },
      {
        _id: oid(202),
        organization: oid(101),
        name: "Mobile Application",
        description:
          "Develop a mobile application for internal operations.",
        creator: users[0]._id,
      },
      {
        _id: oid(203),
        organization: oid(101),
        name: "API Development",
        description:
          "Build and document the project API.",
        creator: users[0]._id,
      },
      {
        _id: oid(204),
        organization: oid(102),
        name: "Beta Platform",
        description:
          "Private to Beta Labs. Acme-only members cannot access this project.",
        creator: users[2]._id,
      },
    ];
    for (const p of projects)
      await Project.updateOne(
        { _id: p._id },
        { $setOnInsert: p },
        { upsert: true, session },
      );
    const tasks = [
      [
        "Review design requirements",
        "Review the approved requirements and define the implementation scope.",
        "IN_PROGRESS",
        "HIGH",
      ],
      [
        "Implement login page",
        "Create accessible login fields and validation feedback.",
        "TODO",
        "MEDIUM",
      ],
      [
        "Test responsive layout",
        "Verify desktop, tablet and mobile layouts.",
        "DONE",
        "MEDIUM",
      ],
      [
        "Prepare deployment checklist",
        "Document configuration and deployment verification steps.",
        "TODO",
        "LOW",
      ],
      [
        "Implement project dashboard",
        "Show projects, task statistics and organization information.",
        "IN_PROGRESS",
        "HIGH",
      ],
      [
        "Approve database schema",
        "Review model relationships and tenant-scoped indexes.",
        "DONE",
        "LOW",
      ],
    ];
    for (const [i, [title, description, status, priority]] of tasks.entries()) {
      await Task.updateOne(
        { _id: oid(301 + i) },
        {
          $setOnInsert: {
            title,
            description,
            status,
            priority,
            organization: oid(101),
            project: oid(201),
            creator: users[0]._id,
            assignee: users[i % 2]._id,
          },
        },
        { upsert: true, session },
      );
    }
    await Task.updateOne(
      { _id: oid(310) },
      {
        $setOnInsert: {
          title: "Implement Beta project API",
          description: "This task belongs only to Beta Labs.",
          organization: oid(102),
          project: oid(204),
          creator: users[2]._id,
          assignee: users[2]._id,
          status: "TODO",
          priority: "HIGH",
        },
      },
      { upsert: true, session },
    );
  });
  console.log(
    "Seed complete: demo@portal.test / member@portal.test / beta@portal.test",
  );
  console.log(
    "New accounts use DEMO_PASSWORD. Existing account passwords are unchanged.",
  );
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
