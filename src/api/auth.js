import api from './axios';

export const authAPI = {
  register: (email, password, displayName, username, phoneNumber) =>
    api.post('/auth/register', { email, password, displayName, username, phoneNumber }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me')
};

