import { jwtDecode } from "jwt-decode";
import type { AuthUser, Paginated } from "./types";

const STORAGE_KEY = "smartsupport_auth_v1";

export function getApiBase(): string {
  return (
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
    "http://localhost:3000"
  );
}

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function readStored(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function writeStored(s: StoredSession | null) {
  if (typeof window === "undefined") return;
  if (!s) sessionStorage.removeItem(STORAGE_KEY);
  else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function getStoredSession(): StoredSession | null {
  return readStored();
}

export function setSession(session: StoredSession) {
  writeStored(session);
}

export function clearSession() {
  writeStored(null);
}

let refreshInFlight: Promise<void> | null = null;

export async function refreshAccessToken(): Promise<void> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const s = readStored();
    if (!s?.refreshToken) {
      clearSession();
      throw new Error("No refresh token");
    }

    const res = await fetch(`${getApiBase()}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: s.refreshToken }),
    });

    const json = (await res.json()) as {
      success: boolean;
      message?: string;
      data?: { accessToken: string; refreshToken: string };
    };

    if (!json.success || !json.data) {
      clearSession();
      throw new ApiError(json.message || "Session expired", res.status);
    }

    writeStored({
      ...s,
      accessToken: json.data.accessToken,
      refreshToken: json.data.refreshToken,
    });
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

interface SuccessEnvelope<T> {
  success: true;
  message?: string;
  data: T;
}

interface PaginatedEnvelope<T> {
  success: true;
  message?: string;
  data: T;
  pagination: { nextCursor: string | null; hasMore: boolean };
}

interface ErrorEnvelope {
  success: false;
  code: number;
  message: string;
}

type AuthMode = "bearer" | "none";

/**
 * Authenticated JSON request. Retries once after refresh on 401.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit & { auth?: AuthMode } = {},
): Promise<T> {
  const { auth: authMode = "bearer", ...fetchOpts } = options as RequestInit & {
    auth?: AuthMode;
  };

  const run = async (afterRefresh: boolean): Promise<T> => {
    const headers = new Headers(fetchOpts.headers);

    if (
      fetchOpts.body &&
      !(fetchOpts.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    if (authMode === "bearer") {
      const s = readStored();
      if (s?.accessToken) {
        headers.set("Authorization", `Bearer ${s.accessToken}`);
      }
    }

    const res = await fetch(`${getApiBase()}${path}`, {
      ...fetchOpts,
      headers,
    });

    const json = (await res.json().catch(() => ({}))) as
      | SuccessEnvelope<T>
      | PaginatedEnvelope<T>
      | ErrorEnvelope;

    if (res.status === 401 && authMode === "bearer" && !afterRefresh) {
      try {
        await refreshAccessToken();
        return run(true);
      } catch {
        throw new ApiError("Unauthorized", 401);
      }
    }

    if (!json || typeof json !== "object" || !("success" in json)) {
      throw new ApiError("Invalid response", res.status);
    }

    if (!json.success) {
      const err = json as ErrorEnvelope;
      throw new ApiError(err.message || "Request failed", err.code || res.status);
    }

    return (json as SuccessEnvelope<T>).data;
  };

  return run(false);
}

export async function apiRequestPaginated<T>(
  path: string,
  options: RequestInit = {},
): Promise<Paginated<T>> {
  const headers = new Headers(options.headers);
  const s = readStored();
  if (s?.accessToken) headers.set("Authorization", `Bearer ${s.accessToken}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const run = async (afterRefresh: boolean): Promise<Paginated<T>> => {
    const res = await fetch(`${getApiBase()}${path}`, { ...options, headers });
    const json = (await res.json().catch(() => ({}))) as
      | PaginatedEnvelope<T>
      | ErrorEnvelope;

    if (res.status === 401 && !afterRefresh) {
      try {
        await refreshAccessToken();
        const s2 = readStored();
        if (s2?.accessToken) headers.set("Authorization", `Bearer ${s2.accessToken}`);
        return run(true);
      } catch {
        throw new ApiError("Unauthorized", 401);
      }
    }

    if (!json || typeof json !== "object" || !("success" in json)) {
      throw new ApiError("Invalid response", res.status);
    }

    if (!json.success) {
      const err = json as ErrorEnvelope;
      throw new ApiError(err.message || "Request failed", err.code || res.status);
    }

    const p = json as PaginatedEnvelope<T>;
    return { data: p.data, pagination: p.pagination };
  };

  return run(false);
}

export async function authLogin(body: { email: string; password: string }) {
  const res = await fetch(`${getApiBase()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as
    | SuccessEnvelope<{ user: AuthUser; accessToken: string; refreshToken: string }>
    | ErrorEnvelope;

  if (!json.success) {
    const err = json as ErrorEnvelope;
    throw new ApiError(err.message, err.code);
  }

  const data = json.data;
  setSession({
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return data.user;
}

export async function authRegister(body: {
  name: string;
  email: string;
  password: string;
  orgName?: string;
  orgId?: string;
}) {
  const res = await fetch(`${getApiBase()}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as
    | SuccessEnvelope<{ user: AuthUser; accessToken: string; refreshToken: string }>
    | ErrorEnvelope;

  if (!json.success) {
    const err = json as ErrorEnvelope;
    throw new ApiError(err.message, err.code);
  }

  const data = json.data;
  setSession({
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return data.user;
}

export async function authLogout() {
  const s = readStored();
  if (s?.refreshToken) {
    await fetch(`${getApiBase()}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: s.refreshToken }),
    }).catch(() => {});
  }
  clearSession();
}

/** Proactive refresh ~60s before access token expiry */
export function scheduleTokenRefresh(onFail: () => void): () => void {
  const s = readStored();
  if (!s?.accessToken) return () => {};

  let exp: number | undefined;
  try {
    exp = jwtDecode<{ exp?: number }>(s.accessToken).exp;
  } catch {
    return () => {};
  }
  if (!exp) return () => {};

  const ms = exp * 1000 - Date.now() - 60_000;
  if (ms <= 0) {
    refreshAccessToken().catch(onFail);
    return () => {};
  }

  const id = window.setTimeout(() => {
    refreshAccessToken().catch(onFail);
  }, ms);

  return () => clearTimeout(id);
}
