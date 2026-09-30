# MULTI-TENANT PROJECT

### MERN Stack · Multi-Tenant Project Portal

A full-stack application for managing organizations, memberships, projects and tasks. Users can belong to multiple organizations and switch between them, while the API independently enforces membership, role permissions and resource ownership for every organization-scoped request.

Built for the **Full Stack Engineering — MERN Stack Developer take-home assignment**.

| Submission detail | Value |
| --- | --- |
| Candidate | Mahendra Choudhary |
| GitHub repository | Pending initial publication |
| Live application | Pending Vercel deployment |
| Demo email | `demo@portal.test` after seeding |
| Demo password | To be supplied with the deployed assignment submission |

> Publication status: the live URL and deployed demo credentials will be added after deployment verification. The seed script lets reviewers create the same demo locally using their own password.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Demo data](#demo-data)
- [Roles and permissions](#roles-and-permissions)
- [Architecture and project structure](#architecture-and-project-structure)
- [Data model](#data-model)
- [Tenant isolation](#tenant-isolation)
- [Authentication and security](#authentication-and-security)
- [API overview](#api-overview)
- [Testing](#testing)
- [Deployment](#deployment)
- [Decisions and limitations](#decisions-and-limitations)

## Features

- **Authentication:** registration, login, logout, protected pages and session restoration.
- **Organizations:** create organizations, view memberships and switch the active organization.
- **Memberships:** organization-specific Owner, Admin and Member roles; add existing registered users.
- **Projects:** create, list, view, update and delete projects within an organization.
- **Tasks:** create, edit, delete and assign tasks to organization members.
- **Task workflow:** `TODO`, `IN_PROGRESS`, `DONE`; `LOW`, `MEDIUM`, `HIGH`; optional due dates.
- **Dashboard:** project, member and task counts, with completion progress for the selected organization.
- **Usability:** project search, task filters, responsive layouts, labeled forms, dialogs and loading/empty/error states.

The interface uses the assignment's terminology and a blue/navy palette inspired by its PDF.

## Technology

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite 7, React Router 7, Context API |
| Styling and icons | Vanilla CSS, Lucide React |
| API client | Native Fetch API with cookie credentials |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose 9 |
| Input validation | Zod 4 |
| Authentication | Opaque database-backed sessions; Node.js crypto/scrypt |
| Security middleware | Helmet, CORS, cookie-parser, express-rate-limit |
| Tests | Node.js test runner, assert, Supertest |

The repository uses npm workspaces for `frontend` and `backend`. Exact installed versions are recorded in `package-lock.json`.

## Local setup

### Prerequisites

- Node.js **22.12 or later**; use a compatible Node 22 or 24 release.
- npm and a complete checkout of the repository.
- MongoDB Atlas or an existing MongoDB replica set. Transactions used by the application do not work with a standalone MongoDB instance.

A complete checkout must include `backend/package.json`, `frontend/package.json`, the imported backend middleware, and both environment examples.

### 1. Install dependencies

Open a terminal at the repository root—the directory containing the root `package.json`:

```bash
npm ci
```

### 2. Create environment files

Git Bash, macOS or Linux:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Set your database connection in `backend/.env` and keep the frontend API path as `/api`.

### 3. Configure MongoDB

Create a database user and permit your development IP in Atlas Network Access. Replace the placeholders below with your own connection details:

```dotenv
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/multi_tenant_project?retryWrites=true&w=majority
```

The database name belongs after `.mongodb.net/` and before `?`. Percent-encode special characters in URI credentials.

### 4. Seed optional demo data

Choose a dedicated password of 12–128 characters, set `DEMO_PASSWORD` in `backend/.env`, then run:

```bash
npm run seed
```

Seeding is optional. A new user can register and create an organization without demo data.

### 5. Start development servers

```bash
npm run dev
```

| Service | Local address |
| --- | --- |
| React application | `http://localhost:5173` |
| API | `http://localhost:5000/api` |
| Database readiness check | `http://localhost:5000/api/health` |

Vite forwards `/api` requests to the local Express server. To run the services separately, use `npm run dev -w backend` and `npm run dev -w frontend` in two terminals.

### Available commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install dependencies from the lockfile |
| `npm run dev` | Run both development servers |
| `npm run seed` | Add demo users, organizations, projects and tasks |
| `npm run build` | Build the frontend into `frontend/dist` |
| `npm start` | Start the Node/Express server |
| `npm test` | Run the backend test script |

## Environment variables

| Variable | Location | Purpose / default |
| --- | --- | --- |
| `MONGODB_URI` | Backend | Required Atlas/replica-set connection string |
| `NODE_ENV` | Backend | `development`, `test` or `production`; default `development` |
| `PORT` | Backend | Local/server listening port; default `5000` |
| `CLIENT_ORIGIN` | Backend | Exact browser origin; default `http://localhost:5173`; no trailing slash |
| `SESSION_DAYS` | Backend | Absolute session lifetime, 1–30 days; default `7` |
| `TRUST_PROXY` | Backend | Number of trusted reverse-proxy hops; default `0`; match the deployment topology |
| `SERVE_FRONTEND` | Backend | Serve the built SPA through Express on a conventional Node host; default `false` |
| `DEMO_PASSWORD` | Seed script | Required only when seeding; never returned by the API |
| `DNS_SERVERS` | Backend | Optional comma-separated DNS resolver IPs; unset uses the runtime default |
| `VITE_API_URL` | Frontend | Public API base path; default `/api` |

`DNS_SERVERS` is read by the connection helper after environment loading. Configure it only when the default resolver fails and an alternative has been verified. Frontend `VITE_` values are public configuration; database credentials belong only on the backend.

## Demo data

All newly created demo accounts use the password supplied in `DEMO_PASSWORD`.

| Account | Acme Inc. | Beta Labs |
| --- | --- | --- |
| `demo@portal.test` | OWNER | MEMBER |
| `member@portal.test` | MEMBER | No membership |
| `beta@portal.test` | No membership | OWNER |

The seed adds two organizations, four projects and seven tasks. Projects include **Website Redesign**, **Mobile Application**, **API Development** and **Beta Platform**.

The script uses fixed resource IDs and insert-only upserts. Re-running it preserves existing edits and account passwords; changing `DEMO_PASSWORD` does not reset accounts that already exist.

For a quick evaluation, sign in as the demo owner, switch organizations, open a project and create a task. Then use the Acme-only member account to check role restrictions and denial of Beta resources.

## Roles and permissions

Permissions apply to the organization being requested, not globally to the user.

| Action | OWNER | ADMIN | MEMBER |
| --- | --- | --- | --- |
| View organization, members, projects and tasks | Yes | Yes | Yes |
| Create, edit and delete projects | Yes | Yes | No |
| Create, edit, delete and assign tasks | Yes | Yes | Yes |
| Add registered users as members | Yes | Yes | No |
| Add registered users as admins | Yes | No | No |

Any authenticated user can create an organization and becomes its Owner. Adding a member requires an existing registered email; the application does not send invitation emails. All members may collaborate on any task within their organization.

## Architecture and project structure

| Path | Responsibility |
| --- | --- |
| `backend/src/config/` | Environment loading and MongoDB connection |
| `backend/src/models/` | User, Session, Organization, Membership, Project and Task schemas |
| `backend/src/middleware/` | Authentication, tenant membership, roles, validation and error handling |
| `backend/src/controllers/` | Application operations and relationship validation |
| `backend/src/routes/index.js` | REST endpoints and authorization order |
| `backend/src/utils/` | Password hashing, session helpers and application errors |
| `backend/src/scripts/seed.js` | Repeatable demo-data creation |
| `backend/tests/unit.test.js` | Focused validation, authorization-helper and HTTP guard tests |
| `frontend/src/components/` | Reusable UI, forms, dialogs and project cards |
| `frontend/src/context/` | Authentication and organization state |
| `frontend/src/hooks/` | Abortable, scope-keyed data loading |
| `frontend/src/services/api.js` | Shared API client |
| `frontend/src/layouts/` | Organization switcher and portal navigation |
| `frontend/src/pages/` | Authentication, dashboard, projects, tasks and members |
| `frontend/src/index.css` | Responsive application styling |
| `docs/API.md` | Detailed request/response contract |

React pages call the shared API client. Express middleware validates the session, tenant membership and relevant role before controllers query MongoDB. The frontend selects a tenant; the server independently decides whether access is allowed.

## Data model

| Model | Main relationship | Important indexes |
| --- | --- | --- |
| User | Global account identity | Unique normalized email |
| Session | Session belongs to a user | Unique token hash, user index, expiry TTL |
| Organization | Creator reference; `_id` is its unique identifier | MongoDB `_id` index |
| Membership | User + organization + organization role | Unique `(organization, user)`; user/creation-date lookup |
| Project | Exactly one organization; immutable creator | `(organization, createdAt)` |
| Task | Exactly one project/organization; optional user assignee | `(organization, project, createdAt)` and `(organization, status)` |

Projects and tasks include created and updated timestamps. Memberships are stored separately so a user can have different roles across organizations without duplicating embedded member arrays.

## Tenant isolation

Every scoped endpoint follows this authorization sequence:

1. Resolve the authenticated user from an unexpired session.
2. Verify that user's membership in the requested organization.
3. Enforce the role required for the action.
4. Match the resource against the authorized organization and its parent relationship.
5. Validate allowed fields and any assignee membership before writing.

Project queries include both project ID and organization ID. Task updates/deletes include task ID, project ID and organization ID. Parent project checks also protect task listing and creation. This prevents mixing IDs even when the caller belongs to both organizations.

Strict schemas reject attempts to supply or change tenant, parent or creator fields through task/project bodies. Query parameters do not override tenant selection. Inaccessible organizations/resources return **404**; a forbidden role within an accessible organization returns **403**; a missing or expired session returns **401**.

Organization creation and owner membership commit in one transaction. Project deletion and deletion of its tasks also commit together. Each task mutation writes the parent project's internal revision in the same transaction, coordinating with concurrent project deletion to prevent orphan tasks.

On the frontend, organization changes reset local state, cancel obsolete requests and prevent an earlier request's data from rendering under a new organization.

## Authentication and security

- Passwords use asynchronous scrypt with random salts and timing-safe comparison.
- Session tokens contain 32 random bytes; only their SHA-256 hashes are stored in MongoDB.
- Cookies are HttpOnly and SameSite=Lax. Production cookies additionally use Secure and the `__Host-` prefix.
- Session expiry is checked on every authenticated request. A TTL index cleans expired records later.
- Logout deletes the server-side session and clears the cookie.
- Mutations require `X-Portal-Request: 1`; a supplied Origin must exactly match `CLIENT_ORIGIN`.
- Zod validation, Helmet headers, bounded JSON bodies and rate limiting protect API boundaries.
- API responses use `Cache-Control: no-store`.

Tokens are not stored in localStorage. The remembered organization ID is a UI preference and grants no access.

## API overview

Base path: `/api`. The nested route design intentionally differs from the PDF's optional examples.

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/auth/register`, `/auth/login` | Public, validated and rate-limited |
| POST | `/auth/logout` | Revokes the supplied session |
| GET | `/auth/me` | Authenticated |
| GET / POST | `/organizations` | Authenticated |
| GET | `/organizations/:organizationId` | Organization member |
| GET | `/organizations/:organizationId/members` | Organization member |
| POST | `/organizations/:organizationId/members` | Owner/Admin; only Owner may add Admin |
| GET | `/organizations/:organizationId/stats` | Organization member |
| GET / POST | `/organizations/:organizationId/projects` | Member for GET; Owner/Admin for POST |
| GET / PATCH / DELETE | `/organizations/:organizationId/projects/:projectId` | Member for GET; Owner/Admin for mutations |
| GET / POST | `/organizations/:organizationId/projects/:projectId/tasks` | Organization member |
| PATCH / DELETE | `/organizations/:organizationId/projects/:projectId/tasks/:taskId` | Organization member |
| GET | `/health` | Readiness check |

Send JSON bodies and the custom request header for mutations. See [API documentation](docs/API.md) for payloads, limits and response formats. Error handling uses meaningful HTTP status codes for invalid input, authentication, permissions, missing resources and conflicts.

## Testing

```bash
npm test
npm run build
```

The supplied suite contains ten tests covering password hashing, strict input validation, partial updates, session hashes, tenant-scoped queries, role checks, unauthenticated requests, CSRF guards and malformed input. Database methods are mocked in authorization-helper tests; these do not constitute MongoDB integration or end-to-end coverage.

Before submission, also verify real registration/login, seed execution, organization switching, all CRUD actions, cross-tenant ID tampering, logout and deep-link refresh against the deployed application. No current test-pass or deployment badge is claimed here.

## Deployment

**Target: Vercel for frontend and backend, MongoDB Atlas for persistence. Deployment preparation is still pending.**

The planned layout uses a Vite frontend project and an Express backend project from this repository. The frontend keeps `/api`; a Vercel rewrite forwards those requests to the backend. This provides a single browser-facing origin for the existing cookie authentication. A separate SPA fallback serves client-side routes.

Before deployment, provide a recognized Express entry point with database initialization and connection reuse, configure the frontend API rewrite and SPA fallback, and set backend environment values for the final frontend origin. The existing `render.yaml` belongs to Render and is not Vercel configuration. Do not rely on `SERVE_FRONTEND=true` to serve the Vite build on Vercel: its Express support does not serve `express.static()` assets.

After deployment, update the submission table with the actual repository URL, live application URL and dedicated demo credentials, then verify the complete application through the public frontend URL.

## Decisions and limitations

- **Shared database, explicit tenant filters:** simple enough for the assignment; not separate databases per tenant.
- **Database sessions instead of JWT:** straightforward server-side logout and expiry checks.
- **Transactions:** preserve related records; require Atlas or another replica set.
- **Client-side filtering:** suitable for small datasets; server-side pagination is a future improvement.
- **Collaborative tasks:** all organization members may edit tasks; no per-task permission model.
- **In-memory rate limits:** apply per process, not globally across serverless instances; a shared store is needed for distributed enforcement.
- **Deliberately limited membership workflow:** no member removal, role editing, ownership transfer or invitation email.
- No password reset, email verification, audit log or real-time synchronization yet.

## References

- [Vercel: Express applications](https://vercel.com/docs/frameworks/backend/express)
- [Vercel: Vite applications](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel: monorepos](https://vercel.com/docs/monorepos)
- [Vercel: rewrites](https://vercel.com/docs/routing/rewrites)

**Author:** [Mahendra Choudhary](https://github.com/mahendrachoudhary-dev)
