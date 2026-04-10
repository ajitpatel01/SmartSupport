import { ApiError } from "../api";
import type { Paginated } from "../types";
import type {
  ModeratorAnalyticsRow,
  ModeratorRow,
  NotificationItem,
  Organization,
  Ticket,
  TicketAnalytics,
  TicketDetail,
  TicketUserRef,
} from "../types";
import {
  type BillingSummary,
  DEMO_ORG_ID,
  DEMO_USER_ADMIN,
  buildInitialTickets,
  computeBillingSummary,
  computeModeratorAnalytics,
  computeTicketAnalytics,
  demoDirectory,
  demoModerators,
  demoNotifications,
  demoOrganization,
} from "./fixtures";

function clone<T>(x: T): T {
  return structuredClone(x);
}

let org: Organization = clone(demoOrganization);
let tickets: TicketDetail[] = clone(buildInitialTickets());
const directory = clone(demoDirectory);
const moderators: ModeratorRow[] = clone(demoModerators);
let notifications: NotificationItem[] = clone(demoNotifications);
const deletedTicketIds = new Set<string>();

let profileName = DEMO_USER_ADMIN.name;

function randomHex(n: number) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

function newTicketId() {
  return `507f1f77bcf86cd799439${randomHex(6)}`;
}

function ticketListView(t: TicketDetail): Ticket {
  const { auditLog, ...rest } = t;
  void auditLog;
  return rest;
}

function sortTicketsForList(list: TicketDetail[]): TicketDetail[] {
  return [...list].sort((a, b) => {
    if (a._id > b._id) return -1;
    if (a._id < b._id) return 1;
    return 0;
  });
}

function parseTicketQuery(search: string): {
  limit: number;
  status?: string;
  priority?: string;
  cursor: string | null;
} {
  const q = search.startsWith("?") ? search.slice(1) : search;
  const sp = new URLSearchParams(q);
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit")) || 20));
  const status = sp.get("status") || undefined;
  const priority = sp.get("priority") || undefined;
  const cursor = sp.get("cursor");
  return {
    limit,
    status: status && status !== "all" ? status : undefined,
    priority: priority && priority !== "all" ? priority : undefined,
    cursor: cursor && cursor.length ? cursor : null,
  };
}

export async function demoFetchOrg(): Promise<Organization> {
  return clone(org);
}

export async function demoPatchOrg(body: {
  name?: string;
  webhookUrl?: string | null;
}): Promise<Organization> {
  if (body.name !== undefined) org = { ...org, name: body.name };
  if (body.webhookUrl !== undefined) org = { ...org, webhookUrl: body.webhookUrl };
  return clone(org);
}

export async function demoInviteMember(body: {
  email: string;
  role?: string;
}): Promise<{ userId: string; email: string; role: string }> {
  const id = newTicketId();
  const role = (body.role ?? "user") as "user" | "moderator" | "admin";
  directory.push({
    _id: id,
    name: body.email.split("@")[0] ?? "Invited",
    email: body.email,
    role,
  });
  if (role === "moderator") {
    moderators.push({
      _id: id,
      name: body.email.split("@")[0] ?? "Invited",
      email: body.email,
      role: "moderator",
      skills: [],
      openTickets: 0,
    });
  }
  return { userId: id, email: body.email, role };
}

export async function demoFetchProfile() {
  return {
    _id: DEMO_USER_ADMIN._id,
    name: profileName,
    email: DEMO_USER_ADMIN.email,
    role: DEMO_USER_ADMIN.role,
    orgId: DEMO_ORG_ID,
  };
}

export async function demoPatchProfile(body: { name?: string }) {
  if (body.name !== undefined) profileName = body.name;
  return demoFetchProfile();
}

export async function demoFetchUsers() {
  return clone(directory);
}

export async function demoFetchTicketsQuery(search: string): Promise<Paginated<Ticket[]>> {
  const { limit, status, priority, cursor } = parseTicketQuery(search);
  let list = sortTicketsForList(tickets.filter((t) => !deletedTicketIds.has(t._id)));
  if (status) list = list.filter((t) => t.status === status);
  if (priority) list = list.filter((t) => t.priority === priority);

  let startIdx = 0;
  if (cursor) {
    startIdx = list.findIndex((t) => t._id < cursor);
    if (startIdx < 0) startIdx = list.length;
  }

  const window = list.slice(startIdx, startIdx + limit + 1);
  const hasMore = window.length > limit;
  const page = hasMore ? window.slice(0, limit) : window;
  const data = page.map((t) => ticketListView(t));
  const nextCursor = hasMore && data.length ? data[data.length - 1]._id : null;

  return {
    data,
    pagination: { nextCursor, hasMore },
  };
}

export async function demoFetchTicket(id: string): Promise<TicketDetail> {
  const t = tickets.find((x) => x._id === id);
  if (!t || deletedTicketIds.has(id)) throw new ApiError("Ticket not found", 404);
  return clone(t);
}

export async function demoCreateTicket(body: {
  title: string;
  description: string;
}): Promise<Ticket> {
  const id = newTicketId();
  const now = new Date().toISOString();
  const actor: TicketUserRef = {
    _id: DEMO_USER_ADMIN._id,
    name: profileName,
    email: DEMO_USER_ADMIN.email,
  };
  const detail: TicketDetail = {
    _id: id,
    title: body.title,
    description: body.description,
    status: "open",
    priority: "medium",
    category: "general",
    orgId: DEMO_ORG_ID,
    createdBy: actor,
    assignedTo: null,
    createdAt: now,
    updatedAt: now,
    auditLog: [
      {
        _id: newTicketId(),
        ticketId: id,
        action: "created",
        actor,
        timestamp: now,
      },
    ],
  };
  tickets = [detail, ...tickets];
  return ticketListView(detail);
}

export async function demoUpdateTicket(
  id: string,
  body: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    category?: string;
  },
): Promise<Ticket> {
  const idx = tickets.findIndex((t) => t._id === id);
  if (idx < 0 || deletedTicketIds.has(id)) throw new ApiError("Ticket not found", 404);
  const cur = tickets[idx];
  const now = new Date().toISOString();
  const actor: TicketUserRef = {
    _id: DEMO_USER_ADMIN._id,
    name: profileName,
    email: DEMO_USER_ADMIN.email,
  };

  let assignedTo = cur.assignedTo;
  if (body.assignedTo !== undefined) {
    if (!body.assignedTo) assignedTo = null;
    else {
      const mod = moderators.find((m) => m._id === body.assignedTo);
      if (mod)
        assignedTo = { _id: mod._id, name: mod.name, email: mod.email };
    }
  }

  const updated: TicketDetail = {
    ...cur,
    status: (body.status as Ticket["status"]) ?? cur.status,
    priority: (body.priority as Ticket["priority"]) ?? cur.priority,
    assignedTo,
    category: body.category ?? cur.category,
    updatedAt: now,
    auditLog: [
      {
        _id: newTicketId(),
        ticketId: id,
        action: "updated",
        actor,
        timestamp: now,
        meta: body,
      },
      ...cur.auditLog,
    ],
  };
  tickets[idx] = updated;
  return ticketListView(updated);
}

export async function demoDeleteTicket(id: string): Promise<null> {
  if (!tickets.some((t) => t._id === id)) throw new ApiError("Ticket not found", 404);
  deletedTicketIds.add(id);
  return null;
}

export async function demoFetchModerators(): Promise<ModeratorRow[]> {
  const openMap = new Map<string, number>();
  for (const t of tickets) {
    if (deletedTicketIds.has(t._id)) continue;
    if (t.status !== "open" && t.status !== "in_progress") continue;
    if (typeof t.assignedTo === "object" && t.assignedTo && "_id" in t.assignedTo) {
      const mid = t.assignedTo._id;
      openMap.set(mid, (openMap.get(mid) ?? 0) + 1);
    }
  }
  return moderators.map((m) => ({
    ...m,
    openTickets: openMap.get(m._id) ?? 0,
  }));
}

export async function demoUpdateModeratorSkills(id: string, skills: string[]): Promise<unknown> {
  const idx = moderators.findIndex((m) => m._id === id);
  if (idx < 0) throw new ApiError("Moderator not found", 404);
  moderators[idx] = { ...moderators[idx], skills };
  return {};
}

export async function demoFetchTicketAnalytics(): Promise<TicketAnalytics> {
  const active = tickets.filter((t) => !deletedTicketIds.has(t._id));
  return computeTicketAnalytics(active);
}

export async function demoFetchModeratorAnalytics(): Promise<ModeratorAnalyticsRow[]> {
  const active = tickets.filter((t) => !deletedTicketIds.has(t._id));
  return computeModeratorAnalytics(active, moderators);
}

export async function demoFetchNotifications(unreadOnly?: boolean) {
  let list = [...notifications];
  if (unreadOnly) list = list.filter((n) => !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;
  return { notifications: clone(list), unreadCount };
}

export async function demoMarkNotificationRead(id: string): Promise<unknown> {
  notifications = notifications.map((n) =>
    n._id === id ? { ...n, read: true } : n,
  );
  return {};
}

export async function demoFetchBillingSummary(): Promise<BillingSummary> {
  const active = tickets.filter((t) => !deletedTicketIds.has(t._id));
  return computeBillingSummary(org, active);
}
