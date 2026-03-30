/**
 * API Client — typed fetch wrapper for the Node.js/Express backend.
 * All frontend data fetching should go through this module.
 * Never call Supabase directly from the frontend for admin operations.
 */

import type { ApiResponse, ApiError } from "./types";

// Note: Vite only exposes VITE_ prefixed vars, but added for compatibility if switched
const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

/**
 * Get the current auth token from localStorage (set after Supabase login)
 */
function getAuthToken(): string | null {
  return localStorage.getItem("sb-access-token");
}

interface FetchOptions extends RequestInit {
  auth?: boolean; // Whether to attach Bearer token (default: true)
}

/**
 * Core fetch wrapper — handles auth headers, JSON parsing, and error normalization.
 */
async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { auth = true, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const json = await res.json();

  if (!res.ok) {
    const err = json as ApiError;
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  return json as ApiResponse<T>;
}

// ─── Listings ────────────────────────────────────────────────────────────────

export const listingsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const query = new URLSearchParams(
      Object.entries(params || {}).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString();
    return apiFetch(`/listings${query ? `?${query}` : ""}`, { auth: false });
  },

  getById: (id: number) => apiFetch(`/listings/${id}`, { auth: false }),

  create: (payload: object) =>
    apiFetch("/listings", { method: "POST", body: JSON.stringify(payload) }),

  update: (id: number, payload: object) =>
    apiFetch(`/listings/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  delete: (id: number) =>
    apiFetch(`/listings/${id}`, { method: "DELETE" }),
};

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookingsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) => {
    const query = new URLSearchParams(
      Object.entries(params || {}).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString();
    return apiFetch(`/bookings${query ? `?${query}` : ""}`);
  },

  getById: (id: string) => apiFetch(`/bookings/${id}`),

  create: (payload: object) =>
    apiFetch("/bookings", { method: "POST", body: JSON.stringify(payload) }),

  updateStatus: (id: string, status: string) =>
    apiFetch(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  cancel: (id: string) => apiFetch(`/bookings/${id}`, { method: "DELETE" }),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams(
      Object.entries(params || {}).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString();
    return apiFetch(`/users${query ? `?${query}` : ""}`);
  },

  getMe: () => apiFetch("/users/me"),

  getById: (id: string) => apiFetch(`/users/${id}`),

  update: (id: string, payload: object) =>
    apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  getStats: (id: string) => apiFetch(`/users/${id}/stats`),
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const paymentsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) => {
    const query = new URLSearchParams(
      Object.entries(params || {}).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString();
    return apiFetch(`/payments${query ? `?${query}` : ""}`);
  },

  getById: (id: string) => apiFetch(`/payments/${id}`),

  create: (payload: object) =>
    apiFetch("/payments", { method: "POST", body: JSON.stringify(payload) }),

  updateStatus: (id: string, status: string) =>
    apiFetch(`/payments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getRevenue: () => apiFetch("/payments/revenue"),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getStats: () => apiFetch("/dashboard/stats"),
  getRecentBookings: (limit = 10) =>
    apiFetch(`/dashboard/recent-bookings?limit=${limit}`),
  getRevenue: () => apiFetch("/dashboard/revenue"),
};
