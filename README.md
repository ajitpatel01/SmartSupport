# AI-SmartSupport

AI-SmartSupport is a production-grade, AI-powered customer support ticket management SaaS. It automatically analyzes, prioritizes, and assigns support tickets using event-driven workflows and Google Gemini AI.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables and fill in secrets
cp .env.example .env

# 3. Start the Inngest dev server (separate terminal)
npm run inngest:dev

# 4. Start the application
npm run dev
```

The API runs at `http://localhost:3000` with the Inngest dashboard at `http://localhost:8288`.

## Project Structure

```
src/
├── config/              # Database, env validation, logger
├── models/              # Mongoose schemas + plugins
├── middleware/           # Auth, RBAC, rate limiting, error handling
├── modules/
│   ├── auth/            # Registration, login, JWT refresh
│   ├── tickets/         # CRUD, events, validators
│   ├── users/           # Profile, org user listing
│   ├── moderators/      # Smart assignment, skill management
│   ├── notifications/   # Email + in-app + templates
│   ├── ai/              # Gemini service, prompts, Zod schemas
│   ├── analytics/       # Ticket + moderator stats (aggregation)
│   ├── billing/         # Plan quota enforcement
│   └── organizations/   # Org management, member invites
├── inngest/             # Event-driven workflow functions
│   └── functions/       # AI analysis, escalation, feedback
├── utils/               # Pagination, error classes, retry logic
├── app.js               # Express app wiring
└── server.js            # Server bootstrap
```

## Key Features

- **AI-Powered Triage** — Gemini analyzes tickets for category, priority, required skills, and moderator guidance notes. Responses validated with Zod.
- **Smart Assignment** — Skill-based moderator matching with regex scoring, workload-aware tie-breaking, and admin fallback.
- **Event-Driven Workflows** — Inngest handles AI analysis on ticket creation, hourly stale ticket escalation, and post-resolution feedback surveys.
- **Multi-Tenancy** — Organization-scoped data isolation via Mongoose plugin + middleware.
- **RBAC** — Three-tier role system (user, moderator, admin) with route-level enforcement.
- **JWT Auth** — Access token (15min) + refresh token (7d) rotation with reuse detection.
- **Notifications** — Email (Mailtrap/SES) with Handlebars templates + in-app notification polling.
- **Analytics** — MongoDB aggregation pipelines for ticket trends and moderator performance.
- **Rate Limiting** — Global + per-org limits, tighter on AI-heavy routes.
- **Billing Stubs** — Plan-based ticket quotas (free: 10/mo, pro: 500, enterprise: unlimited).

## API Routes

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user + create/join org |
| POST | `/api/auth/login` | Login, get token pair |
| POST | `/api/auth/refresh` | Rotate refresh token |
| POST | `/api/auth/logout` | Revoke refresh token |

### Tickets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/tickets` | user+ | Create ticket (triggers AI workflow) |
| GET | `/api/tickets` | user+ | List with filters + cursor pagination |
| GET | `/api/tickets/:id` | user+ | Ticket detail + audit log |
| PATCH | `/api/tickets/:id` | moderator+ | Update status/assignment |
| DELETE | `/api/tickets/:id` | admin | Soft delete |

### Users & Moderators
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | any | Current user profile |
| PATCH | `/api/users/me` | any | Update profile |
| GET | `/api/users` | moderator+ | List org users |
| GET | `/api/moderators` | moderator+ | List moderators + workload |
| PATCH | `/api/moderators/:id/skills` | admin | Update skills |

### Organization
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/org` | any | Org details |
| PATCH | `/api/org` | admin | Update org settings |
| POST | `/api/org/invite` | admin | Invite member via email |

### Notifications & Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | any | In-app notifications |
| PATCH | `/api/notifications/:id/read` | any | Mark as read |
| GET | `/api/analytics/tickets` | admin | Ticket breakdown (30d) |
| GET | `/api/analytics/moderators` | admin | Moderator performance |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ESM) |
| Framework | Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (access + refresh tokens) |
| Background Jobs | Inngest |
| AI | Google Gemini via @inngest/agent-kit |
| Validation | Zod |
| Email | Nodemailer (Mailtrap dev / SES prod) |
| Templates | Handlebars |
| Logging | Winston + Morgan |
| Rate Limiting | express-rate-limit |

## Architecture Decisions & Trade-offs

### AuditLog as a Separate Collection
Audit logs are stored in a dedicated `auditlogs` collection instead of being embedded in the Ticket document. This avoids the 16MB BSON document limit for high-traffic tickets, enables independent querying for compliance/analytics, and allows efficient time-range scans via the compound `(ticketId, timestamp)` index. The trade-off is an extra query when fetching a ticket's full history.

### Cursor-Based Pagination over Offset
We use `_id`-based cursor pagination instead of skip/limit. This prevents page drift when new tickets are created between page loads and avoids the O(n) cost of skip on large collections. The trade-off is that clients cannot jump to arbitrary page numbers — they must paginate sequentially.

### Soft Delete with Query Middleware
Tickets use a `deletedAt` timestamp rather than physical deletion. Mongoose query middleware auto-filters deleted documents, so application code never accidentally surfaces them. This preserves audit trail integrity and enables undelete. The trade-off is slightly more complex queries and the need to explicitly include `deletedAt` in filters when admins want to see deleted tickets.

### Refresh Token Rotation with Reuse Detection
Each refresh token is single-use. When a refresh token is presented that has already been revoked, all tokens for that user are invalidated (indicating potential token theft). This adds a DB lookup per refresh but significantly improves security over long-lived tokens.

### orgScopePlugin via Query Options (not AsyncLocalStorage)
The org-scoping Mongoose plugin reads `orgId` from query options rather than using `AsyncLocalStorage` or `cls-hooked`. This is more explicit and avoids the complexity and performance overhead of CLS, but requires services to pass `{ orgId }` as a query option when needed.

### ESM Throughout
The codebase uses ES Modules (`"type": "module"`) consistently. This matches the existing utility code and enables top-level `await`, tree-shaking potential, and alignment with the modern Node.js ecosystem.

### Plan-Based Quota as Middleware
Billing quota enforcement is implemented as Express middleware rather than in the service layer. This makes it easy to apply to specific routes (ticket creation) without polluting business logic. Full Stripe integration is stubbed for future implementation.

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values. The server validates all required variables at startup and fails fast if any are missing.

## Acknowledgments

- [Inngest](https://www.inngest.com/) — Event-driven background job processing
- [Google Gemini](https://ai.google.dev/) — AI capabilities via @inngest/agent-kit
- [Mailtrap](https://mailtrap.io/) — Email testing in development
- [MongoDB](https://www.mongodb.com/) — Database
