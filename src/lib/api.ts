/**
 * API client for the deployed Node.js/Express backend.
 * All frontend data access should go through this file.
 */

import type { ApiError, ApiResponse, DashboardStats, LoginResponse } from "./types";

export const AUTH_TOKEN_KEY = "pg-admin-access-token";
const LEGACY_AUTH_TOKEN_KEY = "sb-access-token";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.NEXT_PUBLIC_API_URL ||
  (import.meta.env.DEV
    ? "/api/v1"
    : "https://admin-backend-tcys.onrender.com/api/v1");

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.localStorage.getItem(AUTH_TOKEN_KEY) ||
    window.localStorage.getItem(LEGACY_AUTH_TOKEN_KEY)
  );
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
}

function emitAuthExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:expired"));
  }
}

interface FetchOptions extends RequestInit {
  auth?: boolean;
}

function buildQueryString(params?: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function parseResponseBody<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { auth = true, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (auth) {
    const token = getAuthToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const json = await parseResponseBody<ApiResponse<T> | ApiError>(response);

  if (!response.ok) {
    if (response.status === 401 && auth) {
      clearAuthToken();
      emitAuthExpired();
    }

    const message = (json as ApiError | null)?.error || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  if (!json) {
    throw new Error("Invalid API response");
  }

  return json as ApiResponse<T>;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    }),
};

export const listingsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    apiFetch<any>(`/listings${buildQueryString(params)}`, { auth: false }),

  getById: (id: string) => apiFetch<any>(`/listings/${id}`, { auth: false }),

  create: (payload: object) =>
    apiFetch<any>("/listings", { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: object) =>
    apiFetch<any>(`/listings/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  delete: (id: string) => apiFetch<any>(`/listings/${id}`, { method: "DELETE" }),
};

export const bookingsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    apiFetch<any>(`/bookings${buildQueryString(params)}`),

  getById: (id: string) => apiFetch<any>(`/bookings/${id}`),

  create: (payload: object) =>
    apiFetch<any>("/bookings", { method: "POST", body: JSON.stringify(payload) }),

  updateStatus: (id: string, status: string) =>
    apiFetch<any>(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  cancel: (id: string) => apiFetch<any>(`/bookings/${id}`, { method: "DELETE" }),
};

export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiFetch<any>(`/users${buildQueryString(params)}`),

  getMe: () => apiFetch<any>("/users/me"),

  getById: (id: string) => apiFetch<any>(`/users/${id}`),

  update: (id: string, payload: object) =>
    apiFetch<any>(`/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  getStats: (id: string) => apiFetch<any>(`/users/${id}/stats`),
};

export const paymentsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    apiFetch<any>(`/payments${buildQueryString(params)}`),

  getById: (id: string) => apiFetch<any>(`/payments/${id}`),

  create: (payload: object) =>
    apiFetch<any>("/payments", { method: "POST", body: JSON.stringify(payload) }),

  updateStatus: (id: string, status: string) =>
    apiFetch<any>(`/payments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getRevenue: () => apiFetch<any>("/payments/revenue"),
};

export const dashboardApi = {
  getStats: () => apiFetch<DashboardStats>("/dashboard/stats"),
  getRecentBookings: (limit = 10) =>
    apiFetch<any[]>(`/dashboard/recent-bookings?limit=${limit}`),
  getRevenue: () => apiFetch<any[]>("/dashboard/revenue"),
};
