import api from './axios';

export const callsAPI = {
  getCallHistory: () => api.get('/calls'),
  createCall: (type, callType, chatId, groupId, participantIds) =>
    api.post('/calls', { type, callType, chatId, groupId, participantIds }),
  updateCallStatus: (callId, status, participantStatus) =>
    api.put(`/calls/${callId}`, { status, participantStatus })
};

