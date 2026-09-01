// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import axios from "axios";

const API_BASE_URL = typeof window !== "undefined"
  ? "/api"
  : (process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : "http://localhost:4002/api"));

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send httpOnly cookies
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

let accessToken = null;
let isRefreshing = false;
let failedQueue = [];

const AUTH_ENDPOINTS_WITHOUT_REFRESH = [
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/refresh-token",
];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Refresh token if 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const transientStatus = [502, 503, 504].includes(error.response?.status);
    if (originalRequest?.method?.toLowerCase() === "get" && !originalRequest._networkRetry && (!error.response || transientStatus)) {
      originalRequest._networkRetry = true;
      await new Promise((resolve) => setTimeout(resolve, 500));
      return api(originalRequest);
    }

    // Public auth failures must reach the form unchanged. In a fresh/incognito
    // session there is no refresh cookie, so refreshing hides the useful error.
    if (
      !originalRequest ||
      AUTH_ENDPOINTS_WITHOUT_REFRESH.some((endpoint) =>
        originalRequest.url?.endsWith(endpoint),
      )
    ) {
      return Promise.reject(error);
    }

    if (!error.response) {
      error.message = error.message || "Network error. Try again.";
      return Promise.reject(error); // ✅ keep original axios error
    }

    // If 401, try refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post(
          "/auth/refresh-token",
          {},
          { withCredentials: true },
        );

        if (!data?.accessToken) {
          throw new Error("No access token received");
        }

        accessToken = data.accessToken;
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        accessToken = null;

        if (typeof window !== "undefined") {
          if (window.location.pathname !== "/login") {
            window.location.replace("/login");
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Token helpers
export const setAccessToken = (token) => {
  accessToken = token;
};
export const clearAccessToken = () => {
  accessToken = null;
};

export default api;
