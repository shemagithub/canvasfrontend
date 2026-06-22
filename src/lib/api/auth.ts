import { apiUrl } from "./config";
import { ApiError } from "./client";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  avatar_url?: string | null;
};

export type AuthLoginResult = {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
};

/** Matches backend `RegisterIn` (POST /api/auth/register). */
export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
  phone: string;
  avatar_data_url?: string | null;
};

const ACCESS_TOKEN_KEY = "ct_access_token";
const REFRESH_TOKEN_KEY = "ct_refresh_token";
const USER_KEY = "ct_user";

export function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function persistAuthSession(result: AuthLoginResult) {
  localStorage.setItem(ACCESS_TOKEN_KEY, result.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, result.refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(result.user));
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function parseAuthError(res: Response, fallback: string): Promise<never> {
  let detail: unknown;
  try {
    detail = await res.json();
  } catch {
    detail = await res.text();
  }
  const msg = formatApiDetail(detail, fallback);
  throw new ApiError(msg, res.status, detail);
}

function formatApiDetail(detail: unknown, fallback: string): string {
  if (typeof detail === "object" && detail !== null && "detail" in detail) {
    const d = (detail as { detail: unknown }).detail;
    if (typeof d === "string" && d.trim()) return d;
    if (Array.isArray(d)) {
      const parts = d
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object" && "msg" in item) return String((item as { msg: string }).msg);
          return "";
        })
        .filter(Boolean);
      if (parts.length) return parts.join(" ");
    }
  }
  if (typeof detail === "string" && detail.trim()) return detail;
  return fallback;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const token = getStoredAccessToken();
  const headers: HeadersInit = { accept: "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetch(apiUrl("/api/auth/me"), {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    await parseAuthError(res, "Could not load your account.");
  }

  const user = (await res.json()) as AuthUser;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(apiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
    });
  } catch {
    /* clear local session even if network fails */
  }
  clearAuthSession();
}

export async function loginWithCredentials(email: string, password: string): Promise<AuthLoginResult> {
  const res = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    credentials: "include",
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });

  if (!res.ok) {
    await parseAuthError(res, "Invalid email or password");
  }

  const data = (await res.json()) as AuthLoginResult;
  persistAuthSession(data);
  return data;
}

export async function registerAccount(payload: RegisterPayload): Promise<AuthLoginResult> {
  const body = {
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    ...(payload.avatar_data_url ? { avatar_data_url: payload.avatar_data_url } : {}),
  };

  const res = await fetch(apiUrl("/api/auth/register"), {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    await parseAuthError(res, "Could not create your account. Please check your details.");
  }

  const data = (await res.json()) as AuthLoginResult;
  persistAuthSession(data);
  return data;
}

export async function requestPasswordReset(email: string): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(apiUrl("/api/auth/forgot-password"), {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    credentials: "include",
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  if (!res.ok) {
    await parseAuthError(res, "Could not send reset instructions.");
  }

  return (await res.json()) as { ok: boolean; message: string };
}

export async function validatePasswordResetToken(token: string): Promise<{ ok: boolean; email: string }> {
  const params = new URLSearchParams({ token });
  const res = await fetch(apiUrl(`/api/auth/reset-password/validate?${params}`), {
    method: "GET",
    headers: { accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    await parseAuthError(res, "This reset link is invalid or expired.");
  }

  return (await res.json()) as { ok: boolean; email: string };
}

export async function resetPasswordWithToken(
  token: string,
  password: string,
): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(apiUrl("/api/auth/reset-password"), {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, password }),
  });

  if (!res.ok) {
    await parseAuthError(res, "Could not reset your password.");
  }

  return (await res.json()) as { ok: boolean; message: string };
}
