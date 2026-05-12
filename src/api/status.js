import api from './axios';

export const statusAPI = {
  createStatus: (type, text, mediaFile) => {
    const formData = new FormData();
    if (type === 'text') {
      formData.append('type', 'text');
      formData.append('text', text);
    } else {
      formData.append('type', type);
      formData.append('media', mediaFile);
    }
    return api.post('/status', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getContactsStatus: () => api.get('/status/contacts'),
  getMyStatus: () => api.get('/status/me'),
  viewStatus: (statusId) => api.post(`/status/${statusId}/view`)
};

