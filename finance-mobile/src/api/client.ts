// src/api/client.ts
import axios, { AxiosHeaders } from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Access token hanya di memori (lebih aman)
let accessToken: string | null = null;
export function setAccessToken(t: string | null) { accessToken = t; }
export function getAccessToken() { return accessToken; }

type RefreshResponse = { access_token?: string; expires_in?: string };

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // penting untuk cookie HttpOnly refresh
});

// Pastikan headers berupa AxiosHeaders, lalu set Authorization
api.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }
  if (!(config.headers instanceof AxiosHeaders)) {
    config.headers = new AxiosHeaders(config.headers);
  }
  if (accessToken) {
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

// ===== Auto-refresh on 401 (tanpa loop) =====
let refreshing = false;
let queue: Array<() => void> = [];

// Track request yang sudah di-retry tanpa menambah properti pada config
const retried = new WeakSet<InternalAxiosRequestConfig>();

async function doRefresh(): Promise<void> {
  const r = await api.post<RefreshResponse>("/auth/refresh");
  if (r.data.access_token) setAccessToken(r.data.access_token);
}

function isAuthEndpoint(url: string): boolean {
  return /\/auth\/(refresh|login|signup|dev-signup|verify|persist\/attach|persist\/logout|attach-tenant)(\b|\/|\?)/.test(url);
}

api.interceptors.response.use(
  (res) => res,
  async (err: unknown) => {
    const error = err as AxiosError;
    const original = error.config as InternalAxiosRequestConfig | undefined;
    const status = error.response?.status;
    const url = (original?.url || "").toString();

    if (
      status === 401 &&
      original &&
      !retried.has(original) &&
      !isAuthEndpoint(url)
    ) {
      retried.add(original);

      if (!refreshing) {
        refreshing = true;
        try {
          await doRefresh();
        } finally {
          refreshing = false;
          queue.forEach((fn) => fn());
          queue = [];
        }
      }

      return new Promise((resolve, reject) => {
        queue.push(async () => {
          try { resolve(api(original)); }
          catch (e) { reject(e); }
        });
      });
    }

    return Promise.reject(err);
  }
);

export default api;
