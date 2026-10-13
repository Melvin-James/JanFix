import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "../store/authStore";

const axiosInstance = axios.create({

  baseURL: import.meta.env.VITE_API_BASE_URL,

  withCredentials: true,

});

let isRefreshing = false;

type RefreshSubscriber = {

  resolve: () => void;

  reject: (error: unknown) => void;

};

let refreshSubscribers: RefreshSubscriber[] = [];

const subscribeToTokenRefresh = (resolve: () => void, reject: (error: unknown) => void): void => {
  refreshSubscribers.push({ resolve, reject });
};

const notifyTokenRefresh = (): void => { refreshSubscribers.forEach(({ resolve }) => resolve()); refreshSubscribers = []; };

const rejectTokenRefresh = (error: unknown): void => { refreshSubscribers.forEach(({ reject }) => reject(error)); refreshSubscribers = []; }

axiosInstance.interceptors.response.use(

  (response) => response,

  async (error: AxiosError) => {

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; };

    const responseData = error.response?.data;

    const errorMessage =
      typeof responseData === 'object' &&
        responseData !== null &&
        "message" in responseData &&
        typeof responseData.message === 'string'
        ? responseData.message
        : undefined;

    if (
      error.response?.status === 403 &&
      errorMessage === "Your account has been blocked. Please contact support."
    ) {
      useAuthStore.getState().clearAuth();

      window.location.replace("/login");

      return Promise.reject(error);
    }

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh-token") ||
      originalRequest.url?.includes("/auth/me")
    ) {

      return Promise.reject(error);

    }

    originalRequest._retry = true;

    if (isRefreshing) {

      return new Promise((resolve, reject) => {

        subscribeToTokenRefresh(() => { resolve(axiosInstance(originalRequest)); }, reject);

      });

    }

    isRefreshing = true;

    try {
      const response = await axiosInstance.post("/auth/refresh-token");

      const { user } = response.data.data;

      useAuthStore.getState().setUser(user);

      notifyTokenRefresh();

      return axiosInstance(originalRequest);

    } catch (refreshError) {

      useAuthStore.getState().clearAuth();

      rejectTokenRefresh(refreshError);

      return Promise.reject(refreshError);

    } finally {

      isRefreshing = false;

    }
  }
);


export default axiosInstance;