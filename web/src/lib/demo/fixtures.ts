import type {
  AuthUser,
  ModeratorAnalyticsRow,
  ModeratorRow,
  NotificationItem,
  Organization,
  Ticket,
  TicketAnalytics,
  TicketDetail,
  TicketUserRef,
} from "../types";

export const DEMO_ORG_ID = "507f1f77bcf86cd799439001";

export const DEMO_USER_ADMIN: AuthUser = {
  _id: "507f1f77bcf86cd799439002",
  name: "Alex Rivera",
  email: "alex@acme-demo.io",
  role: "admin",
  orgId: DEMO_ORG_ID,
};

const userMod1: TicketUserRef = {
  _id: "507f1f77bcf86cd799439003",
  name: "Jordan Lee",
  email: "jordan@acme-demo.io",
};

const userMod2: TicketUserRef = {
  _id: "507f1f77bcf86cd799439004",
  name: "Sam Patel",
  email: "sam@acme-demo.io",
};

const userEnd: TicketUserRef = {
  _id: "507f1f77bcf86cd799439005",
  name: "Casey Morgan",
  email: "casey@customer-demo.io",
};

const userAdmin: TicketUserRef = {
  _id: DEMO_USER_ADMIN._id,
  name: DEMO_USER_ADMIN.name,
  email: DEMO_USER_ADMIN.email,
};

export const demoOrganization: Organization = {
  _id: DEMO_ORG_ID,
  name: "Acme Robotics",
  plan: "pro",
  seats: 25,
  webhookUrl: "https://hooks.acme-demo.io/smartsupport",
  createdAt: "2025-01-15T10:00:00.000Z",
  updatedAt: "2026-04-01T12:00:00.000Z",
};

/** Team directory (moderators + admins + users) */
export const demoDirectory = [
  { _id: DEMO_USER_ADMIN._id, name: DEMO_USER_ADMIN.name, email: DEMO_USER_ADMIN.email, role: "admin" },
  { _id: userMod1._id, name: userMod1.name, email: userMod1.email, role: "moderator" },
  { _id: userMod2._id, name: userMod2.name, email: userMod2.email, role: "moderator" },
  {
    _id: "507f1f77bcf86cd799439006",
    name: "Riley Chen",
    email: "riley@acme-demo.io",
    role: "user",
  },
  { _id: userEnd._id, name: userEnd.name, email: userEnd.email, role: "user" },
];

export const demoModerators: ModeratorRow[] = [
  {
    _id: userMod1._id,
    name: userMod1.name,
    email: userMod1.email,
    role: "moderator",
    skills: ["Node.js", "billing", "API", "Stripe"],
    openTickets: 3,
  },
  {
    _id: userMod2._id,
    name: userMod2.name,
    email: userMod2.email,
    role: "moderator",
    skills: ["SSO", "security", "SAML", "account"],
    openTickets: 2,
  },
];

function audit(
  id: string,
  ticketId: string,
  action: string,
  actor: TicketUserRef,
  timestamp: string,
  meta?: Record<string, unknown>,
) {
  return { _id: id, ticketId, action, actor, timestamp, meta };
}

function baseTicket(
  partial: Omit<Ticket, "orgId" | "createdBy"> & { createdBy?: TicketUserRef },
): Ticket {
  const createdBy = partial.createdBy ?? userEnd;
  return {
    ...partial,
    orgId: DEMO_ORG_ID,
    createdBy,
  };
}

/** Initial ticket list — IDs descending for cursor pagination (newest first by _id). */
export function buildInitialTickets(): TicketDetail[] {
  const t1: TicketDetail = {
    ...baseTicket({
      _id: "507f1f77bcf86cd79943901b",
      title: "Invoice shows double charge after plan upgrade",
      description:
        "We upgraded from Pro to Enterprise on Mar 28. Stripe shows two charges for April. Need reconciliation.",
      status: "in_progress",
      priority: "high",
      category: "billing",
      skills: ["billing", "Stripe"],
      aiNotes:
        "Verify subscription timeline in Stripe. Customer expects proration credit toward Enterprise.",
      assignedTo: userMod1,
      createdAt: "2026-04-10T09:12:00.000Z",
      updatedAt: "2026-04-10T14:30:00.000Z",
    }),
    auditLog: [
      audit(
        "507f1f77bcf86cd799439200",
        "507f1f77bcf86cd79943901b",
        "created",
        userEnd,
        "2026-04-10T09:12:00.000Z",
      ),
      audit(
        "507f1f77bcf86cd799439201",
        "507f1f77bcf86cd79943901b",
        "priority_changed",
        userAdmin,
        "2026-04-10T09:45:00.000Z",
        { oldValue: "medium", newValue: "high" },
      ),
      audit(
        "507f1f77bcf86cd799439202",
        "507f1f77bcf86cd79943901b",
        "assignedTo_changed",
        userAdmin,
        "2026-04-10T10:00:00.000Z",
      ),
    ],
  };

  const t2: TicketDetail = {
    ...baseTicket({
      _id: "507f1f77bcf86cd79943901a",
      title: "SSO login fails with Okta — error AADSTS50011",
      description:
        "Users in EU region cannot complete SAML login. Redirect URI mismatch suspected.",
      status: "open",
      priority: "critical",
      category: "technical",
      skills: ["SSO", "SAML", "Okta"],
      aiNotes:
        "Check SAML ACS URL and Entity ID against Okta admin console. EU tenant may need separate app registration.",
      assignedTo: userMod2,
      createdAt: "2026-04-10T08:00:00.000Z",
      updatedAt: "2026-04-10T08:05:00.000Z",
    }),
    auditLog: [
      audit(
        "507f1f77bcf86cd799439203",
        "507f1f77bcf86cd79943901a",
        "created",
        userEnd,
        "2026-04-10T08:00:00.000Z",
      ),
    ],
  };

  const t3: TicketDetail = {
    ...baseTicket({
      _id: "507f1f77bcf86cd799439019",
      title: "Feature request: export tickets to CSV",
      description: "Need bulk export for compliance audit next quarter.",
      status: "open",
      priority: "low",
      category: "feature_request",
      skills: ["product"],
      aiNotes: "Consider parity with analytics CSV export. Moderate effort.",
      assignedTo: null,
      createdAt: "2026-04-09T16:20:00.000Z",
      updatedAt: "2026-04-09T16:20:00.000Z",
    }),
    auditLog: [
      audit(
        "507f1f77bcf86cd799439204",
        "507f1f77bcf86cd799439019",
        "created",
        userEnd,
        "2026-04-09T16:20:00.000Z",
      ),
    ],
  };

  const t4: TicketDetail = {
    ...baseTicket({
      _id: "507f1f77bcf86cd799439018",
      title: "Webhook deliveries retrying — 429 from our endpoint",
      description: "SmartSupport webhooks hit our rate limit during incident. Can we backoff?",
      status: "resolved",
      priority: "medium",
      category: "technical",
      skills: ["API", "webhooks"],
      aiNotes: "Recommend exponential backoff on 429; document headers.",
      assignedTo: userMod1,
      createdAt: "2026-04-08T11:00:00.000Z",
      updatedAt: "2026-04-09T09:00:00.000Z",
    }),
    auditLog: [
      audit(
        "507f1f77bcf86cd799439205",
        "507f1f77bcf86cd799439018",
        "created",
        userEnd,
        "2026-04-08T11:00:00.000Z",
      ),
      audit(
        "507f1f77bcf86cd799439206",
        "507f1f77bcf86cd799439018",
        "status_changed",
        userMod1,
        "2026-04-09T09:00:00.000Z",
        { oldValue: "in_progress", newValue: "resolved" },
      ),
    ],
  };

  const t5: TicketDetail = {
    ...baseTicket({
      _id: "507f1f77bcf86cd799439017",
      title: "Account locked after too many MFA attempts",
      description: "VP Sales locked out. Need unlock and guidance on MFA reset.",
      status: "closed",
      priority: "medium",
      category: "account",
      skills: ["account", "security"],
      aiNotes: "Admin unlock path; suggest device trust policy.",
      assignedTo: userMod2,
      createdAt: "2026-04-07T13:45:00.000Z",
      updatedAt: "2026-04-07T18:00:00.000Z",
    }),
    auditLog: [
      audit(
        "507f1f77bcf86cd799439207",
        "507f1f77bcf86cd799439017",
        "created",
        userEnd,
        "2026-04-07T13:45:00.000Z",
      ),
    ],
  };

  const t6: TicketDetail = {
    ...baseTicket({
      _id: "507f1f77bcf86cd799439016",
      title: "Bug: notification email template shows wrong org name",
      description: "Footer says 'Organization' instead of our company name.",
      status: "in_progress",
      priority: "medium",
      category: "bug_report",
      skills: ["email"],
      aiNotes: "Verify Handlebars context org.name binding.",
      assignedTo: userMod1,
      createdAt: "2026-04-06T10:00:00.000Z",
      updatedAt: "2026-04-08T12:00:00.000Z",
    }),
    auditLog: [
      audit(
        "507f1f77bcf86cd799439208",
        "507f1f77bcf86cd799439016",
        "created",
        userEnd,
        "2026-04-06T10:00:00.000Z",
      ),
    ],
  };

  const t7: TicketDetail = {
    ...baseTicket({
      _id: "507f1f77bcf86cd799439015",
      title: "Question: data residency for Enterprise",
      description: "Do you offer EU-only data residency for tickets and attachments?",
      status: "resolved",
      priority: "low",
      category: "general",
      skills: ["sales"],
      aiNotes: "Standard enterprise FAQ — point to trust page.",
      assignedTo: userMod2,
      createdAt: "2026-04-05T09:30:00.000Z",
      updatedAt: "2026-04-05T15:00:00.000Z",
    }),
    auditLog: [
      audit(
        "507f1f77bcf86cd799439209",
        "507f1f77bcf86cd799439015",
        "created",
        userEnd,
        "2026-04-05T09:30:00.000Z",
      ),
    ],
  };

  const t8: TicketDetail = {
    ...baseTicket({
      _id: "507f1f77bcf86cd799439014",
      title: "API rate limit headers inconsistent",
      description: "Sometimes X-RateLimit-Remaining is missing on 200 responses.",
      status: "open",
      priority: "high",
      category: "bug_report",
      skills: ["API"],
      aiNotes: "Middleware ordering issue suspected.",
      assignedTo: userMod1,
      createdAt: "2026-04-04T14:10:00.000Z",
      updatedAt: "2026-04-04T14:15:00.000Z",
    }),
    auditLog: [
      audit(
        "507f1f77bcf86cd799439210",
        "507f1f77bcf86cd799439014",
        "created",
        userEnd,
        "2026-04-04T14:10:00.000Z",
      ),
    ],
  };

  const t9: TicketDetail = {
    ...baseTicket({
      _id: "507f1f77bcf86cd799439013",
      title: "Moderator workload report export",
      description: "Need PDF export of moderator analytics for Q1 review.",
      status: "open",
      priority: "low",
      category: "feature_request",
      skills: ["analytics"],
      aiNotes: "Workaround: use browser print on analytics page.",
      assignedTo: null,
      createdAt: "2026-04-03T11:00:00.000Z",
      updatedAt: "2026-04-03T11:00:00.000Z",
    }),
    auditLog: [
      audit(
        "507f1f77bcf86cd799439211",
        "507f1f77bcf86cd799439013",
        "created",
        userEnd,
        "2026-04-03T11:00:00.000Z",
      ),
    ],
  };

  const t10: TicketDetail = {
    ...baseTicket({
      _id: "507f1f77bcf86cd799439012",
      title: "SLA breach alert — no false positive filter",
      description: "We get escalation emails for tickets already resolved.",
      status: "resolved",
      priority: "medium",
      category: "bug_report",
      skills: ["workflows"],
      aiNotes: "Race between resolve event and hourly cron.",
      assignedTo: userMod2,
      createdAt: "2026-04-02T08:00:00.000Z",
      updatedAt: "2026-04-03T10:00:00.000Z",
    }),
    auditLog: [
      audit(
        "507f1f77bcf86cd799439212",
        "507f1f77bcf86cd799439012",
        "created",
        userEnd,
        "2026-04-02T08:00:00.000Z",
      ),
    ],
  };

  const t11: TicketDetail = {
    ...baseTicket({
      _id: "507f1f77bcf86cd799439011",
      title: "Onboarding: connect Mailtrap for dev",
      description: "Step-by-step for engineering to receive transactional emails in dev.",
      status: "closed",
      priority: "low",
      category: "general",
      skills: ["docs"],
      aiNotes: "Internal doc link shared.",
      assignedTo: userMod1,
      createdAt: "2026-04-01T09:00:00.000Z",
      updatedAt: "2026-04-01T17:00:00.000Z",
    }),
    auditLog: [
      audit(
        "507f1f77bcf86cd799439213",
        "507f1f77bcf86cd799439011",
        "created",
        userEnd,
        "2026-04-01T09:00:00.000Z",
      ),
    ],
  };

  const t12: TicketDetail = {
    ...baseTicket({
      _id: "507f1f77bcf86cd799439010",
      title: "Welcome — test ticket from migration",
      description: "Placeholder from sandbox migration. Safe to close.",
      status: "closed",
      priority: "low",
      category: "general",
      skills: [],
      aiNotes: "Noise ticket from migration script.",
      assignedTo: null,
      createdAt: "2026-03-28T12:00:00.000Z",
      updatedAt: "2026-03-28T12:30:00.000Z",
    }),
    auditLog: [
      audit(
        "507f1f77bcf86cd799439214",
        "507f1f77bcf86cd799439010",
        "created",
        userAdmin,
        "2026-03-28T12:00:00.000Z",
      ),
    ],
  };

  return [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12];
}

export const demoNotifications: NotificationItem[] = [
  {
    _id: "507f1f77bcf86cd799439300",
    type: "escalation",
    channel: "in_app",
    payload: { title: "SSO ticket escalated — Okta error", ticketId: "507f1f77bcf86cd79943901a" },
    read: false,
    createdAt: "2026-04-10T08:30:00.000Z",
  },
  {
    _id: "507f1f77bcf86cd799439301",
    type: "assignment",
    channel: "in_app",
    payload: { title: "Invoice double charge", ticketId: "507f1f77bcf86cd79943901b" },
    read: false,
    createdAt: "2026-04-10T10:05:00.000Z",
  },
  {
    _id: "507f1f77bcf86cd799439302",
    type: "resolution",
    channel: "in_app",
    payload: { title: "Webhook 429 issue", ticketId: "507f1f77bcf86cd799439018" },
    read: true,
    createdAt: "2026-04-09T09:15:00.000Z",
  },
];

export function computeTicketAnalytics(tickets: Ticket[]): TicketAnalytics {
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  for (const t of tickets) {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
    byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
    const cat = t.category || "uncategorized";
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;
  }
  return {
    period: "30d",
    total: tickets.length,
    byStatus,
    byPriority,
    byCategory,
  };
}

export function computeModeratorAnalytics(
  tickets: Ticket[],
  moderators: ModeratorRow[],
): ModeratorAnalyticsRow[] {
  return moderators.map((m) => {
    const assigned = tickets.filter(
      (t) =>
        typeof t.assignedTo === "object" &&
        t.assignedTo &&
        "_id" in t.assignedTo &&
        t.assignedTo._id === m._id,
    );
    const resolvedTickets = assigned.filter((t) => t.status === "resolved").length;
    const openTickets = assigned.filter((t) => t.status === "open" || t.status === "in_progress").length;
    let sumMs = 0;
    let resolvedCount = 0;
    for (const t of assigned) {
      if (t.status === "resolved") {
        sumMs += new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime();
        resolvedCount += 1;
      }
    }
    return {
      moderatorId: m._id,
      name: m.name,
      email: m.email,
      totalTickets: assigned.length,
      resolvedTickets,
      openTickets,
      avgResolutionMs: resolvedCount ? sumMs / resolvedCount : null,
    };
  });
}

export interface BillingSummary {
  plan: "free" | "pro" | "enterprise";
  monthlyTicketLimit: number | null;
  ticketsThisMonth: number;
  percentUsed: number | null;
}

export function computeBillingSummary(
  org: Organization,
  tickets: Ticket[],
): BillingSummary {
  const limits: Record<string, number | null> = {
    free: 10,
    pro: 500,
    enterprise: null,
  };
  const monthlyTicketLimit = limits[org.plan] ?? limits.free;
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const ticketsThisMonth = tickets.filter((t) => new Date(t.createdAt) >= start).length;
  const percentUsed =
    monthlyTicketLimit != null && monthlyTicketLimit > 0
      ? Math.min(100, Math.round((ticketsThisMonth / monthlyTicketLimit) * 100))
      : null;
  return {
    plan: org.plan,
    monthlyTicketLimit,
    ticketsThisMonth,
    percentUsed,
  };
}
