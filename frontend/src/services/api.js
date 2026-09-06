/**
 * api.js - Central HTTP client for all backend communication.
 *
 * Interceptor behaviour:
 *  401 → attempt ONE silent refresh (single in-flight, queues parallel requests)
 *        On success: retry original request once.
 *        On failure: clear auth state and redirect to /login.
 *  403 → toast "You do not have permission to perform this action."
 *  422 → pass field errors through untouched so forms can map them.
 *  429 → toast "Too many requests. Please wait a moment."
 *  5xx → toast "Something went wrong. Please try again."
 */

import axios from "axios";
import { toast } from "sonner";

const BASE_URL = "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── 401 Refresh Queue ────────────────────────────────────────────────────────
let isRefreshing = false;
let pendingRequests = [];

const processQueue = (error, token = null) => {
  pendingRequests.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  pendingRequests = [];
};

function forceLogout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/signup")) {
    window.location.href = "/login";
  }
}

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // ── 401: attempt silent token refresh (once) ─────────────────────────────
    if (
      status === 401 &&
      !originalRequest._retried &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retried = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        isRefreshing = false;
        forceLogout();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem("accessToken", accessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 403: permission error ─────────────────────────────────────────────────
    if (status === 403) {
      const msg =
        error.response?.data?.message ||
        "You do not have permission to perform this action.";
      toast.error(msg);
    }

    // ── 422: field validation errors — pass through untouched ─────────────────
    // Components handle these by mapping errors onto form inputs

    // ── 429: rate limit ───────────────────────────────────────────────────────
    if (status === 429) {
      toast.error("Too many requests. Please wait a moment.");
    }

    // ── 5xx: server error ─────────────────────────────────────────────────────
    if (status >= 500) {
      toast.error("Something went wrong. Please try again.");
    }

    return Promise.reject(error);
  }
);

export default api;

