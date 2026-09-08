import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// When accessed from browser, /api proxies to backend via next.config.ts rewrites
// When accessed server-side, it uses BACKEND_INTERNAL_URL or production backend
const API_BASE = typeof window !== "undefined" ? "/api" : (process.env.BACKEND_INTERNAL_URL || "https://api.royalrentalcars.in") + "/api";

export const TOKEN_KEY = "royalcars_access_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function removeStoredToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Request interceptor: attach Bearer token if present
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AUTH_SAFE_PATHS = ["/auth/me", "/auth/login", "/auth/register", "/auth/refresh"];

let refreshPromise: Promise<any> | null = null;

function refreshSessionOnce() {
  if (!refreshPromise) {
    refreshPromise = api
      .post<{ access_token?: string }>("/auth/refresh")
      .then((res) => {
        if (res.data?.access_token) {
          setStoredToken(res.data.access_token);
        }
        return res;
      })
      .finally(() => {
        setTimeout(() => {
          refreshPromise = null;
        }, 50);
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config: any = error.config;
    const url = config?.url || "";

    if (
      status !== 401 ||
      AUTH_SAFE_PATHS.some((p) => url.includes(p)) ||
      !config ||
      config._retry
    ) {
      return Promise.reject(error);
    }

    config._retry = true;
    try {
      await refreshSessionOnce();
      // Update Authorization header with refreshed token for the retried request
      const refreshedToken = getStoredToken();
      if (refreshedToken && config.headers) {
        config.headers.Authorization = `Bearer ${refreshedToken}`;
      }
      return api(config);
    } catch (refreshErr) {
      removeStoredToken();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.dispatchEvent(new CustomEvent("royalcars-auth-expired"));
      }
      return Promise.reject(refreshErr);
    }
  }
);
