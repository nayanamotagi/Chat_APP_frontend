import api from './axios';
import { getApiBaseUrl } from '../config/apiConfig';

export const authAPI = {

  register: (email, password, displayName, username, phoneNumber) =>
    api.post(
      `${getApiBaseUrl()}/api/auth/register`,
      { email, password, displayName, username, phoneNumber }
    ),

  login: (email, password) =>
    api.post(
      `${getApiBaseUrl()}/api/auth/login`,
      { email, password }
    ),

  changePassword: (currentPassword, newPassword) =>
    api.post(
      `${getApiBaseUrl()}/api/auth/change-password`,
      { currentPassword, newPassword }
    ),

  refreshToken: (refreshToken) =>
    api.post(
      `${getApiBaseUrl()}/api/auth/refresh-token`,
      { refreshToken }
    ),

  logout: () =>
    api.post(`${getApiBaseUrl()}/api/auth/logout`),

  getMe: () =>
    api.get(`${getApiBaseUrl()}/api/auth/me`)
};