import axios, { AxiosError } from "axios";

// When accessed from browser, /api proxies to backend via next.config.ts rewrites
// When accessed server-side, it uses BACKEND_INTERNAL_URL or localhost:8000
const API_BASE = typeof window !== "undefined" ? "/api" : (process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000") + "/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

const AUTH_SAFE_PATHS = ["/auth/me", "/auth/login", "/auth/register", "/auth/refresh"];

let refreshPromise: Promise<any> | null = null;

function refreshSessionOnce() {
  if (!refreshPromise) {
    refreshPromise = api.post("/auth/refresh").finally(() => {
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
      return api(config);
    } catch (refreshErr) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.dispatchEvent(new CustomEvent("royalcars-auth-expired"));
      }
      return Promise.reject(refreshErr);
    }
  }
);
