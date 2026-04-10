import { setSession } from "../api";
import { DEMO_USER_ADMIN } from "./fixtures";

/** JWT-shaped strings (payload exp far in future) — only used to satisfy client session + decode. */
const DEMO_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.Td_demo_access";
const DEMO_REFRESH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.Td_demo_refresh";

/** Persist demo user so ProtectedRoute and RBAC work without the API. */
export function enterDemoSession(): void {
  setSession({
    user: { ...DEMO_USER_ADMIN },
    accessToken: DEMO_ACCESS_TOKEN,
    refreshToken: DEMO_REFRESH_TOKEN,
  });
}
