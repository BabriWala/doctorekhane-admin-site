// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : "http://localhost:4002/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send httpOnly cookies
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

let accessToken = null;
let isRefreshing = false;
let failedQueue = [];

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

    // ❗ VERY IMPORTANT - skip refresh endpoint
    if (originalRequest.url === "/auth/refresh-token") {
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
        console.log("I am here in refresh");
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
        console.log("I am here in refresh error");
        processQueue(refreshError, null);
        accessToken = null;

        if (typeof window !== "undefined") {
          window.location.href = "/login";
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
