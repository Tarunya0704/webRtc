import { getStoredToken } from "@/lib/auth";
import type { JoinMeetingResponse, Meeting, TokenResponse, User } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  { skipAuth = false }: { skipAuth?: boolean } = {}
): Promise<T> {
  const token = skipAuth ? null : getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  signup: (email: string, name: string, password: string) =>
    request<TokenResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
    }),

  login: (email: string, password: string) =>
    request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/api/auth/me"),

  upcomingMeetings: () => request<Meeting[]>("/api/meetings/upcoming"),

  recentMeetings: () => request<Meeting[]>("/api/meetings/recent"),

  createInstantMeeting: () =>
    request<JoinMeetingResponse>("/api/meetings/instant", { method: "POST" }),

  getMeeting: (code: string) => request<Meeting>(`/api/meetings/${code}`),

  // skipAuth: joining by ID/link is a guest action independent of the dashboard's
  // default-user session — without this, every tab would auto-login as the same
  // demo account and every joiner would incorrectly get assigned the host role.
  joinMeeting: (code: string, displayName: string) =>
    request<JoinMeetingResponse>(
      `/api/meetings/${code}/join`,
      {
        method: "POST",
        body: JSON.stringify({ display_name: displayName }),
      },
      { skipAuth: true }
    ),

  leaveMeeting: (code: string, participantId: number) =>
    request<void>(`/api/meetings/${code}/leave`, {
      method: "POST",
      body: JSON.stringify({ participant_id: participantId }),
    }),

  endMeeting: (code: string) =>
    request<void>(`/api/meetings/${code}/end`, { method: "POST" }),

  scheduleMeeting: (payload: {
    title: string;
    description?: string;
    scheduled_at: string;
    duration_minutes: number;
  }) =>
    request<Meeting>("/api/meetings/schedule", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateMeeting: (
    code: string,
    payload: Partial<{
      title: string;
      description: string;
      scheduled_at: string;
      duration_minutes: number;
    }>
  ) =>
    request<Meeting>(`/api/meetings/${code}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // Host launching their own scheduled/upcoming meeting — unlike joinMeeting, this
  // intentionally sends the auth token so the backend assigns the host role.
  startMeeting: (code: string, displayName: string) =>
    request<JoinMeetingResponse>(`/api/meetings/${code}/join`, {
      method: "POST",
      body: JSON.stringify({ display_name: displayName }),
    }),
};
