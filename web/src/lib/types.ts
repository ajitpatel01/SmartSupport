export type UserRole = "user" | "moderator" | "admin";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  orgId: string;
}

export interface Organization {
  _id: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
  seats: number;
  webhookUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export interface TicketUserRef {
  _id: string;
  name: string;
  email: string;
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string;
  skills?: string[];
  aiNotes?: string;
  assignedTo: TicketUserRef | string | null;
  createdBy: TicketUserRef | string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntry {
  _id: string;
  ticketId: string;
  action: string;
  actor: TicketUserRef | string;
  meta?: Record<string, unknown>;
  timestamp: string;
}

export interface TicketDetail extends Ticket {
  auditLog: AuditEntry[];
}

export interface Paginated<T> {
  data: T;
  pagination: { nextCursor: string | null; hasMore: boolean };
}

export interface NotificationItem {
  _id: string;
  userId?: string;
  type: string;
  channel?: string;
  payload?: { title?: string; ticketId?: string; [key: string]: unknown };
  read: boolean;
  createdAt: string;
}

export interface ModeratorRow {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  skills: string[];
  openTickets: number;
}

export interface TicketAnalytics {
  period: string;
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface ModeratorAnalyticsRow {
  moderatorId: string;
  name: string;
  email: string;
  totalTickets: number;
  resolvedTickets: number;
  openTickets: number;
  avgResolutionMs: number | null;
}
