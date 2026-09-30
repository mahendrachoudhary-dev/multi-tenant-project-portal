import { test, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/unused_unit_database";
process.env.CLIENT_ORIGIN = "http://localhost:5173";

const { schemas, patch } = await import("../src/middleware/validate.js");
const { hashPassword, verifyPassword } =
  await import("../src/utils/password.js");
const { digest } = await import("../src/utils/session.js");
const { requireMembership, requireManager } =
  await import("../src/middleware/tenant.js");
const { projectFilter, loadProject } =
  await import("../src/controllers/projectController.js");
const Membership = (await import("../src/models/Membership.js")).default;
const Project = (await import("../src/models/Project.js")).default;
const { app } = await import("../src/app.js");

test("scrypt salts differ and correct/incorrect passwords verify correctly", async () => {
  const a = await hashPassword("Correct-Password-2026");
  const b = await hashPassword("Correct-Password-2026");
  assert.notEqual(a, b);
  assert.equal(await verifyPassword("Correct-Password-2026", a), true);
  assert.equal(await verifyPassword("Wrong-Password-2026", a), false);
});

test("strict validation rejects tenant/creator/role and query-operator injection", () => {
  assert.equal(
    schemas.task.safeParse({ title: "Task", organization: "a".repeat(24) })
      .success,
    false,
  );
  assert.equal(
    schemas.project.safeParse({ name: "Project", creator: "b".repeat(24) })
      .success,
    false,
  );
  assert.equal(
    schemas.register.safeParse({
      name: "User",
      email: "user@example.com",
      password: "Password-long-2026",
      role: "OWNER",
    }).success,
    false,
  );
  assert.equal(
    schemas.login.safeParse({ email: { $ne: null }, password: "x" }).success,
    false,
  );
});

test("PATCH does not apply creation defaults or erase omitted task fields", () => {
  assert.deepEqual(patch(schemas.task).parse({ status: "DONE" }), {
    status: "DONE",
  });
  assert.deepEqual(patch(schemas.project).parse({ name: "Renamed" }), {
    name: "Renamed",
  });
  assert.equal(patch(schemas.task).safeParse({}).success, false);
});

test("input bounds, dates and enums are validated and email is normalized", () => {
  assert.equal(schemas.task.safeParse({ title: "  " }).success, false);
  assert.equal(
    schemas.task.safeParse({ title: "Task", dueDate: "2026-02-31" }).success,
    false,
  );
  assert.equal(
    schemas.task.safeParse({ title: "Task", status: "UNKNOWN" }).success,
    false,
  );
  assert.equal(
    schemas.register.parse({
      name: "  User  ",
      email: "USER@EXAMPLE.COM",
      password: "Password-long-2026",
    }).email,
    "user@example.com",
  );
});

test("opaque session digest is fixed-width and does not store the raw token", () => {
  const token = "a".repeat(64);
  assert.match(digest(token), /^[a-f0-9]{64}$/);
  assert.notEqual(digest(token), token);
  assert.notEqual(digest(token), digest("b".repeat(64)));
});

test("membership guard scopes lookup to authenticated user and route organization", async () => {
  const req = {
    params: { organizationId: "a".repeat(24) },
    user: { _id: "b".repeat(24) },
    body: { organization: "c".repeat(24) },
  };
  const member = { role: "MEMBER" };
  const stub = mock.method(Membership, "findOne", async (filter) => {
    assert.deepEqual(filter, {
      organization: req.params.organizationId,
      user: req.user._id,
    });
    return member;
  });
  try {
    let continued = false;
    await requireMembership(req, {}, () => {
      continued = true;
    });
    assert.equal(continued, true);
    assert.equal(req.organizationId, req.params.organizationId);
    assert.equal(req.membership, member);
  } finally {
    stub.mock.restore();
  }
});

test("non-members receive a nondisclosing 404 and members cannot act as managers", async () => {
  const stub = mock.method(Membership, "findOne", async () => null);
  try {
    await assert.rejects(
      () =>
        requireMembership(
          {
            params: { organizationId: "a".repeat(24) },
            user: { _id: "b".repeat(24) },
          },
          {},
          () => {},
        ),
      (error) => error.status === 404,
    );
  } finally {
    stub.mock.restore();
  }
  assert.throws(
    () => requireManager({ membership: { role: "MEMBER" } }, {}, () => {}),
    (error) => error.status === 403,
  );
  let continued = false;
  requireManager({ membership: { role: "ADMIN" } }, {}, () => {
    continued = true;
  });
  assert.equal(continued, true);
});

test("project lookup includes both project and authorized organization", async () => {
  const req = {
    params: { projectId: "c".repeat(24) },
    organizationId: "a".repeat(24),
    query: { organization: "b".repeat(24) },
  };
  assert.deepEqual(projectFilter(req), {
    _id: "c".repeat(24),
    organization: "a".repeat(24),
  });
  const stub = mock.method(Project, "findOne", async (filter) => {
    assert.deepEqual(filter, projectFilter(req));
    return null;
  });
  try {
    await assert.rejects(
      () => loadProject(req, {}, () => {}),
      (error) => error.status === 404,
    );
  } finally {
    stub.mock.restore();
  }
});

test("actual Express pipeline blocks missing authentication and CSRF requests", async () => {
  await request(app).get("/api/organizations").expect(401);
  await request(app).post("/api/auth/logout").send({}).expect(403);
  await request(app)
    .post("/api/auth/logout")
    .set({ "X-Portal-Request": "1", Origin: "https://evil.example" })
    .send({})
    .expect(403);
  await request(app)
    .post("/api/auth/logout")
    .set({ "X-Portal-Request": "1", Origin: "http://localhost:5173" })
    .send({})
    .expect(204);
});

test("actual Express pipeline rejects malformed bodies and does not expose stack traces", async () => {
  const r = await request(app)
    .post("/api/auth/register")
    .set({ "X-Portal-Request": "1", "Content-Type": "application/json" })
    .send("{broken")
    .expect(400);
  assert.equal(r.body.stack, undefined);
  await request(app)
    .post("/api/auth/login")
    .set({ "X-Portal-Request": "1" })
    .send({ email: { $ne: null }, password: "x" })
    .expect(400);
});
