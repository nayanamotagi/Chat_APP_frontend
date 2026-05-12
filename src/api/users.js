import api from './axios';

export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadProfilePhoto: (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/users/profile-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updatePrivacy: (settings) => api.put('/users/privacy', settings),
  searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
  blockUser: (userId) => api.post(`/users/block/${userId}`),
  unblockUser: (userId) => api.post(`/users/unblock/${userId}`),
  deleteAccount: () => api.delete('/users/account')
};

