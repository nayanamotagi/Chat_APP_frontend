import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import apiConfig from '../config/apiConfig';

const regapi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || apiConfig.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

regapi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

regapi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        if (refreshToken) {
          const response = await axios.post(
            `${apiConfig.API_BASE_URL}/api/auth/refresh-token`,
            {
              refreshToken
            }
          );

          const { accessToken } = response.data;
          useAuthStore.getState().setAuth(
            useAuthStore.getState().user,
            accessToken,
            refreshToken
          );

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return regapi(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
    console.log(apiConfig.API_BASE_URL);
  }
);

export default regapi;

