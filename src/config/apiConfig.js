const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://chat-app-backend-1-6m8p.onrender.com';

export function getApiBaseUrl() {
    return API_BASE_URL;
}

export default {
    API_BASE_URL,
};