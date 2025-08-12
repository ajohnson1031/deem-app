// src/utils/api.ts
import { API_BASE_URL } from '@env';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Toast from 'react-native-toast-message';

import { emitter } from './events';
import { deleteToken, getToken, saveToken } from './secureStore';

const api = axios.create({
  baseURL: `${API_BASE_URL}`, // Replace with API_BASE_URL for production
  withCredentials: true, // Ensures refresh token cookies are sent
});

type DecodedToken = {
  exp: number; // expiration time (in seconds)
};

let isRefreshing = false;
let isLoggingOut = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 👇 Add proactive expiry check BEFORE sending request
api.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      const now = Date.now() / 1000; // current time in seconds
      const buffer = 30; // seconds before expiry to refresh

      if (decoded.exp - now < buffer && !isRefreshing) {
        isRefreshing = true;

        try {
          const res = await axios.post<{ token: string }>(`${API_BASE_URL}/auth/refresh`, {});

          const newToken = res.data.token;
          await saveToken(newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          config.headers.Authorization = `Bearer ${newToken}`;
        } catch (err) {
          await deleteToken();
          emitter.emit('logout');
          Toast.show({
            type: 'error',
            text1: 'Session expired',
            text2: 'Please log in again.',
          });
          console.error(err);
        } finally {
          isRefreshing = false;
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('Token decode failed:', err);
    }
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshCall = originalRequest.url?.includes('/auth/refresh');
    const isLogoutCall = originalRequest.url?.includes('/logout');

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshCall) {
        emitter.emit('logout');
        Toast.show({
          type: 'error',
          text1: 'Session expired',
          text2: 'Please log in again.',
        });
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Prevent infinite logout loop
      if (!isLogoutCall && !isLoggingOut) {
        isLoggingOut = true;
        try {
          emitter.emit('logout');
          Toast.show({
            type: 'error',
            text1: 'Session expired',
            text2: 'Please log in again.',
          });
        } finally {
          isLoggingOut = false;
        }
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export { api };
