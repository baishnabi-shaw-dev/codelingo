import axios from 'axios';
import { useAuthStore } from '../context/store';
import type { Language } from '../utils/constants';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (email: string, username: string, password: string) =>
    api.post('/auth/register', { email, username, password }),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  getCurrentUser: () => api.get('/auth/me'),
};

export const codeAPI = {
  execute: (code: string, language: Language | string, stdin = '', signal?: AbortSignal) =>
    api.post('/code/execute', { code, language, stdin }, { signal }),
  getHistory: () => api.get('/code/history'),
};

export const analysisAPI = {
  analyze: (
    code: string,
    language: Language | string,
    analysisType: string,
    provider: string | null = null
  ) =>
    api.post('/analysis/analyze', { code, language, analysisType, provider }),
  getHistory: () => api.get('/analysis/history'),
};

export const settingsAPI = {
  updateApiKey: (
    provider: string,
    apiKey: string,
    consentAccepted: boolean,
    consentText: string
  ) => api.post('/settings/api-key', { provider, apiKey, consentAccepted, consentText }),
  deleteApiKey: (provider: string) => api.delete(`/settings/api-key/${provider}`),
  setPreferredProvider: (provider: string) =>
    api.post('/settings/provider', { provider }),
  getSettings: () => api.get('/settings'),
};

export const conversionAPI = {
  convert: (
    sourceCode: string,
    fromLanguage: Language | string,
    toLanguage: Language | string,
    addHelpfulComments: boolean,
    provider: string | null = null
  ) =>
    api.post('/conversion/convert', {
      sourceCode,
      fromLanguage,
      toLanguage,
      addHelpfulComments,
      provider,
    }),
  getSupported: () => api.get('/conversion/supported'),
};

export default api;
