import { apiRequest, apiRequestPaginated } from "./api";
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
  return apiRequest<Organization>("/api/org");
}

export async function patchOrg(body: { name?: string; webhookUrl?: string | null }) {
  return apiRequest<Organization>("/api/org", { method: "PATCH", body: JSON.stringify(body) });
}

export async function inviteMember(body: { email: string; role?: string }) {
  return apiRequest<{ userId: string; email: string; role: string }>("/api/org/invite", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchProfile() {
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
  return apiRequest<unknown>("/api/users/me", { method: "PATCH", body: JSON.stringify(body) });
}

export async function fetchUsers() {
  return apiRequest<
    { _id: string; name: string; email: string; role: string }[]
  >("/api/users");
}

export async function fetchTicketsQuery(search: string) {
  return apiRequestPaginated<Ticket[]>(`/api/tickets${search}`);
}

export async function fetchTicket(id: string) {
  return apiRequest<TicketDetail>(`/api/tickets/${id}`);
}

export async function createTicket(body: { title: string; description: string }) {
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
  return apiRequest<Ticket>(`/api/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteTicket(id: string) {
  return apiRequest<null>(`/api/tickets/${id}`, { method: "DELETE" });
}

export async function fetchModerators() {
  return apiRequest<ModeratorRow[]>("/api/moderators");
}

export async function updateModeratorSkills(id: string, skills: string[]) {
  return apiRequest<unknown>(`/api/moderators/${id}/skills`, {
    method: "PATCH",
    body: JSON.stringify({ skills }),
  });
}

export async function fetchTicketAnalytics() {
  return apiRequest<TicketAnalytics>("/api/analytics/tickets");
}

export async function fetchModeratorAnalytics() {
  return apiRequest<ModeratorAnalyticsRow[]>("/api/analytics/moderators");
}

export async function fetchNotifications(unreadOnly?: boolean) {
  const q = unreadOnly ? "?unread=true" : "";
  return apiRequest<{ notifications: NotificationItem[]; unreadCount: number }>(
    `/api/notifications${q}`,
  );
}

export async function markNotificationRead(id: string) {
  return apiRequest<unknown>(`/api/notifications/${id}/read`, { method: "PATCH" });
}

export type { Paginated };
