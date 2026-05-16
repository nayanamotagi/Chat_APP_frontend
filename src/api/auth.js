import api from './axios';

export const authAPI = {
  register: (email, password, displayName, username, phoneNumber) =>
    api.post('api/auth/register', { email, password, displayName, username, phoneNumber }),
  login: (email, password) =>
    api.post('api/auth/login', { email, password }),
  changePassword: (currentPassword, newPassword) =>
    api.post('api/auth/change-password', { currentPassword, newPassword }),
  refreshToken: (refreshToken) => api.post('api/auth/refresh-token', { refreshToken }),
  logout: () => api.post('api/auth/logout'),
  getMe: () => api.get('api/auth/me')
};

