# AI-SmartSupport

AI-SmartSupport is a multi-tenant, AI-powered helpdesk platform that automates ticket triage, intelligent routing, and agent workload balancing. Built on an event-driven architecture with Google Gemini for NLP-based classification and prioritization.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables and fill in secrets
cp .env.example .env

# 3. Start the Inngest dev server (separate terminal)
npm run inngest:dev

# 4. (Optional) Seed demo org + users + tickets in MongoDB
npm run seed

# 5. Start the application
npm run dev
```

The API runs at `http://localhost:3000` with the Inngest dashboard at `http://localhost:8288`.

### Web app (Next.js)

The SaaS dashboard and marketing site live in [`web/`](web/).

```bash
cd web
cp .env.local.example .env.local
# Ensure NEXT_PUBLIC_API_URL points at the API (default http://localhost:3000)
npm install
npm run dev
```

The UI defaults to **port 3001** (`http://localhost:3001`). Run the API on **3000** and the web app on **3001** in separate terminals.

### Android app (Kotlin / Jetpack Compose)

An optional native client lives in [`android/`](android/). It uses the same backend-oriented patterns (ViewModel, repository, Firebase Crashlytics/Analytics, release R8) as a production baseline. Build with JDK 17+ and the Android SDK:

```bash
cd android
./gradlew :app:assembleDebug
```

Replace [`android/app/google-services.json`](android/app/google-services.json) with the file from the [Firebase Console](https://console.firebase.google.com) for package `com.smartsupport.app` if you want real Crashlytics and Analytics. Optional API base URL: copy [`android/local.properties.example`](android/local.properties.example) to `local.properties` and set `API_BASE_URL`. More detail: [`android/BUILD.txt`](android/BUILD.txt) and [`android/PERF.md`](android/PERF.md).

### Demo mode (UI only, no API)

Set in `web/.env.local`:

```bash
NEXT_PUBLIC_DEMO_MODE=true
```

Restart the Next.js dev server. Use **View demo** on the marketing home or login page to open the dashboard with in-memory sample data (tickets, analytics, notifications). Changes persist for the browser session only and are not sent to the API. Omit this flag for normal development against the Express backend.

**Production CORS:** set `CORS_ORIGIN` in the API `.env` to your deployed web origin (comma-separated if multiple), e.g. `https://app.example.com`. Leave it unset in local dev to allow any origin.

## Architecture Overview

```
android/               # Kotlin + Compose client (Firebase, OkHttp/Retrofit) — optional
web/                   # Next.js 15 — marketing + authenticated app (TanStack Query, shadcn/ui)
scripts/               # e.g. MongoDB seed script (npm run seed)
src/
├── config/              # Database, env validation, structured logging
├── models/              # Mongoose schemas + tenant-scoping plugins
├── middleware/           # Auth, RBAC, rate limiting, quota enforcement, error handling
├── modules/
│   ├── auth/            # Registration, login, JWT rotation + reuse detection
│   ├── tickets/         # Full lifecycle management, event emission, validation
│   ├── users/           # Profile management, org-scoped user listing
│   ├── moderators/      # Skill-based routing, workload-aware assignment
│   ├── notifications/   # Transactional email + in-app notification delivery
│   ├── ai/              # Gemini integration, prompt engineering, schema-validated responses
│   ├── analytics/       # Aggregation pipelines — ticket KPIs + agent performance
│   ├── billing/         # Quota middleware, usage summary API, checkout placeholder
│   └── organizations/   # Tenant provisioning, member invitations, org settings
├── inngest/             # Event-driven workflow orchestration
│   └── functions/       # AI triage, SLA escalation, CSAT collection
├── utils/               # Cursor pagination, typed errors, retry helpers
├── app.js               # Express middleware pipeline
└── server.js            # Server bootstrap + graceful shutdown
```

## Core Capabilities

### Intelligent Ticket Triage
Gemini analyzes inbound tickets to extract category, priority (P0–P3), required skill tags, and structured agent guidance notes. All AI responses are schema-validated via Zod to guarantee downstream contract compliance.

### Skill-Based Routing & Load Balancing
Tickets are routed to the best-fit agent using regex-scored skill matching against agent profiles. Ties are broken by current workload (open ticket count), with automatic admin fallback when no qualified agent is available.

### Event-Driven Workflow Engine
Inngest orchestrates background workflows decoupled from the request cycle:
- **Ticket Created** → AI triage + auto-assignment pipeline
- **Hourly Cron** → SLA breach detection + escalation
- **Ticket Resolved** → CSAT survey dispatch after configurable cooldown

### Multi-Tenant Data Isolation
Organization-scoped data partitioning via a Mongoose query plugin. Every query is automatically filtered by `orgId` through middleware injection — no tenant data leakage by default.

### Role-Based Access Control (RBAC)
Three-tier permission model enforced at the route level:
| Role | Scope |
|------|-------|
| **User** | Create tickets, view own tickets, manage profile |
| **Moderator** | All user permissions + ticket updates, assignment, org user listing |
| **Admin** | Full access — org settings, analytics dashboards, skill management, soft deletes |

### JWT Authentication with Token Rotation
Short-lived access tokens (15 min) paired with single-use refresh tokens (7 day). Refresh token reuse triggers immediate revocation of all active sessions for that user, mitigating token-theft replay attacks.

### Transactional Notifications
Dual-channel delivery — templated transactional emails (Handlebars + Nodemailer) and in-app notification polling. Supports Mailtrap in development and SES in production.

### Analytics & Reporting
MongoDB aggregation pipelines powering:
- **Ticket KPIs** — Volume trends, category/priority breakdowns, resolution time distributions (30-day window)
- **Agent Performance** — Tickets handled, avg. resolution time, workload distribution

### Usage-Based Quota Enforcement
Plan-tier limits enforced via middleware before ticket creation:
| Plan | Monthly Ticket Quota |
|------|---------------------|
| Free | 10 |
| Pro | 500 |
| Enterprise | Unlimited |

Billing: monthly quotas are enforced in middleware; `GET /api/billing/summary` exposes plan and current-month ticket usage for the dashboard. Stripe Checkout is not wired—`POST /api/billing/checkout` returns a placeholder message for future activation.

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Provision user + create/join tenant |
| POST | `/api/auth/login` | Authenticate, returns token pair |
| POST | `/api/auth/refresh` | Rotate refresh token |
| POST | `/api/auth/logout` | Revoke refresh token |

### Tickets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/tickets` | User+ | Submit ticket (triggers triage pipeline) |
| GET | `/api/tickets` | User+ | List with filters + cursor pagination |
| GET | `/api/tickets/:id` | User+ | Ticket detail + audit trail |
| PATCH | `/api/tickets/:id` | Moderator+ | Update status / reassign |
| DELETE | `/api/tickets/:id` | Admin | Soft delete (preserves audit trail) |

### Users & Moderators
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | Any | Current user profile |
| PATCH | `/api/users/me` | Any | Update profile |
| GET | `/api/users` | Moderator+ | List tenant users |
| GET | `/api/moderators` | Moderator+ | List agents + workload stats |
| PATCH | `/api/moderators/:id/skills` | Admin | Update agent skill tags |

### Organization
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/org` | Any | Tenant details |
| PATCH | `/api/org` | Admin | Update tenant settings |
| POST | `/api/org/invite` | Admin | Invite member via email |

### Notifications & Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | Any | Poll in-app notifications |
| PATCH | `/api/notifications/:id/read` | Any | Mark notification as read |
| GET | `/api/analytics/tickets` | Admin | Ticket KPI dashboard (30-day) |
| GET | `/api/analytics/moderators` | Admin | Agent performance metrics |

### Billing (read-only summary + placeholder checkout)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/billing/summary` | Any | Plan tier, monthly ticket count vs quota |
| POST | `/api/billing/checkout` | Any | Placeholder until Stripe is enabled |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile (optional) | Kotlin, Jetpack Compose, Firebase (Crashlytics/Analytics), OkHttp/Retrofit |
| Runtime | Node.js (ESM) |
| Framework | Express |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (access + refresh token rotation) |
| Background Jobs | Inngest (event-driven orchestration) |
| AI / NLP | Google Gemini via @inngest/agent-kit |
| Validation | Zod (runtime schema enforcement) |
| Email | Nodemailer (Mailtrap dev / SES prod) |
| Templates | Handlebars |
| Logging | Winston (structured) + Morgan (HTTP) |
| Rate Limiting | express-rate-limit (global + per-tenant) |

## Design Decisions

### Audit Log as a Separate Collection
Audit events are stored in a dedicated `auditlogs` collection rather than embedded in ticket documents. This avoids the 16 MB BSON document size limit for high-volume tickets, enables independent compliance queries, and supports efficient time-range scans via compound `(ticketId, timestamp)` indexing. Trade-off: requires an additional query when loading a ticket's full history.

### Cursor-Based Pagination
`_id`-based cursor pagination prevents page drift caused by concurrent writes and avoids the O(n) cost of `skip()` on large collections. Trade-off: clients must paginate sequentially — no random page access.

### Soft Deletes with Query Middleware
Tickets use a `deletedAt` timestamp instead of physical deletion. Mongoose query middleware auto-filters deleted documents, preserving audit trail integrity and enabling recovery. Trade-off: slightly more complex queries when admins need to surface deleted records.

### Refresh Token Reuse Detection
Single-use refresh tokens with family-based revocation. If a previously consumed token is presented again, all tokens for that user are invalidated — a strong signal of credential theft. Trade-off: one DB lookup per refresh request.

### Explicit Tenant Scoping (No AsyncLocalStorage)
The org-scoping Mongoose plugin reads `orgId` from query options rather than relying on `AsyncLocalStorage` or CLS. This keeps tenant context explicit and avoids CLS performance overhead. Trade-off: services must pass `{ orgId }` as a query option.

### Quota Enforcement as Middleware
Plan-tier limits are enforced in Express middleware rather than in the service layer, keeping billing concerns decoupled from business logic. Only applied to ticket-creation routes to minimize overhead.

## Troubleshooting

- **HTTP 429 on `/api/tickets`, `/api/org`, etc.** — The API uses `express-rate-limit` (global per IP + a stricter per-organization limit on **POST /api/tickets** because it triggers AI triage). Limits are **much higher in `NODE_ENV=development`** than in production. If you still hit 429 after many requests, wait for the 15-minute window to reset or restart the dev server (limits use an in-memory store by default).
- **Invitation or notification email not received** — Ensure `MAILTRAP_SMTP_USER` and `MAILTRAP_SMTP_PASS` are set to a valid [Mailtrap](https://mailtrap.io/) inbox (see `.env.example`). If SMTP fails, `POST /api/org/invite` returns **503** with a hint (the invited user is not left half-created). Check server logs for `Email failed` or `Invite email failed`.

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values. The server validates all required variables at startup and fails fast on missing configuration.

## Acknowledgments

- [Inngest](https://www.inngest.com/) — Event-driven workflow orchestration
- [Google Gemini](https://ai.google.dev/) — NLP-powered ticket analysis
- [Mailtrap](https://mailtrap.io/) — Transactional email testing
- [MongoDB](https://www.mongodb.com/) — Document database
