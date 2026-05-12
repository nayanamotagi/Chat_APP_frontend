import api from './axios';

export const aiAPI = {
  chat: (message, context) =>
    api.post('/ai/chat', { message, context }),
  summarizeChat: (messages) =>
    api.post('/ai/summarize', { messages }),
  translateMessage: (text, targetLanguage) =>
    api.post('/ai/translate', { text, targetLanguage })
};

