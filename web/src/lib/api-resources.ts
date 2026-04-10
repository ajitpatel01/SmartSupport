import { apiRequest, apiRequestPaginated } from "./api";
import { demoDelay, isDemoMode } from "./demo/config";
import type { BillingSummary } from "./demo/fixtures";
import * as demo from "./demo/store";
import type {
  ModeratorAnalyticsRow,
  ModeratorRow,
  NotificationItem,
  Organization,
  Paginated,
  Ticket,
  TicketAnalytics,
  TicketDetail,
} from "./types";

export async function fetchOrg() {
  if (isDemoMode()) return demoDelay(await demo.demoFetchOrg());
  return apiRequest<Organization>("/api/org");
}

export async function patchOrg(body: { name?: string; webhookUrl?: string | null }) {
  if (isDemoMode()) return demoDelay(await demo.demoPatchOrg(body));
  return apiRequest<Organization>("/api/org", { method: "PATCH", body: JSON.stringify(body) });
}

export async function inviteMember(body: { email: string; role?: string }) {
  if (isDemoMode()) return demoDelay(await demo.demoInviteMember(body));
  return apiRequest<{ userId: string; email: string; role: string }>("/api/org/invite", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchProfile() {
  if (isDemoMode()) return demoDelay(await demo.demoFetchProfile());
  return apiRequest<{
    _id: string;
    name: string;
    email: string;
    role: string;
    orgId: string;
    skills?: string[];
  }>("/api/users/me");
}

export async function patchProfile(body: { name?: string }) {
  if (isDemoMode()) return demoDelay(await demo.demoPatchProfile(body));
  return apiRequest<unknown>("/api/users/me", { method: "PATCH", body: JSON.stringify(body) });
}

export async function fetchUsers() {
  if (isDemoMode()) return demoDelay(await demo.demoFetchUsers());
  return apiRequest<
    { _id: string; name: string; email: string; role: string }[]
  >("/api/users");
}

export async function fetchTicketsQuery(search: string) {
  if (isDemoMode()) return demoDelay(await demo.demoFetchTicketsQuery(search));
  return apiRequestPaginated<Ticket[]>(`/api/tickets${search}`);
}

export async function fetchTicket(id: string) {
  if (isDemoMode()) return demoDelay(await demo.demoFetchTicket(id));
  return apiRequest<TicketDetail>(`/api/tickets/${id}`);
}

export async function createTicket(body: { title: string; description: string }) {
  if (isDemoMode()) return demoDelay(await demo.demoCreateTicket(body));
  return apiRequest<Ticket>("/api/tickets", { method: "POST", body: JSON.stringify(body) });
}

export async function updateTicket(
  id: string,
  body: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    category?: string;
  },
) {
  if (isDemoMode()) return demoDelay(await demo.demoUpdateTicket(id, body));
  return apiRequest<Ticket>(`/api/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteTicket(id: string) {
  if (isDemoMode()) return demoDelay(await demo.demoDeleteTicket(id));
  return apiRequest<null>(`/api/tickets/${id}`, { method: "DELETE" });
}

export async function fetchModerators() {
  if (isDemoMode()) return demoDelay(await demo.demoFetchModerators());
  return apiRequest<ModeratorRow[]>("/api/moderators");
}

export async function updateModeratorSkills(id: string, skills: string[]) {
  if (isDemoMode()) return demoDelay(await demo.demoUpdateModeratorSkills(id, skills));
  return apiRequest<unknown>(`/api/moderators/${id}/skills`, {
    method: "PATCH",
    body: JSON.stringify({ skills }),
  });
}

export async function fetchTicketAnalytics() {
  if (isDemoMode()) return demoDelay(await demo.demoFetchTicketAnalytics());
  return apiRequest<TicketAnalytics>("/api/analytics/tickets");
}

export async function fetchModeratorAnalytics() {
  if (isDemoMode()) return demoDelay(await demo.demoFetchModeratorAnalytics());
  return apiRequest<ModeratorAnalyticsRow[]>("/api/analytics/moderators");
}

export async function fetchNotifications(unreadOnly?: boolean) {
  if (isDemoMode()) return demoDelay(await demo.demoFetchNotifications(unreadOnly));
  const q = unreadOnly ? "?unread=true" : "";
  return apiRequest<{ notifications: NotificationItem[]; unreadCount: number }>(
    `/api/notifications${q}`,
  );
}

export async function markNotificationRead(id: string) {
  if (isDemoMode()) return demoDelay(await demo.demoMarkNotificationRead(id));
  return apiRequest<unknown>(`/api/notifications/${id}/read`, { method: "PATCH" });
}

export async function fetchBillingSummary() {
  if (isDemoMode()) return demoDelay(await demo.demoFetchBillingSummary());
  return apiRequest<BillingSummary>("/api/billing/summary");
}

export type { Paginated, BillingSummary, Organization };
