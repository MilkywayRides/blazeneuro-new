import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_BASE_URL = 'https://auth.blazeneuro.com';
const SITE_URL = 'https://blazeneuro.com';

const api = axios.create({
  baseURL: SITE_URL,
  timeout: 30000,
});

const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 30000,
});

// Interceptor to add token to requests
const addTokenInterceptor = async (config: any) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Also add cookie if needed by backend
    config.headers.Cookie = `better-auth.session_token=${token}`;
  }
  return config;
};

api.interceptors.request.use(addTokenInterceptor);
authApi.interceptors.request.use(addTokenInterceptor);

export const AuthAPI = {
  signIn: async (email: string, password: string) => {
    const response = await authApi.post('/api/auth/sign-in/email', { email, password });
    if (response.data.session?.token) {
      await saveSession(response.data);
    }
    return response.data;
  },

  signUp: async (name: string, email: string, password: string) => {
    const response = await authApi.post('/api/auth/sign-up/email', { name, email, password });
    if (response.data.session?.token) {
      await saveSession(response.data);
    }
    return response.data;
  },

  getSession: async () => {
    const response = await authApi.get('/api/auth/get-session');
    return response.data;
  },

  signOut: async () => {
    await authApi.post('/api/auth/sign-out', {});
    await clearSession();
  },

  verifyGoogleToken: async (idToken: string) => {
    const response = await authApi.post('/api/auth/google/android', { idToken });
    if (response.data.token) {
      await saveSession({
        session: { token: response.data.token },
        user: response.data.user
      });
    }
    return response.data;
  },

  verifyGitHubCode: async (code: string, state: string) => {
    const response = await authApi.post('/api/auth/github/android/token', { code, state });
    if (response.data.token) {
      await saveSession({
        session: { token: response.data.token },
        user: response.data.user
      });
    }
    return response.data;
  }
};

export const ContentAPI = {
  getCourses: async () => {
    const response = await api.get('/api/courses');
    return response.data;
  },

  getBlogs: async (limit = 20, offset = 0) => {
    const response = await api.get(`/api/mobile/blogs?limit=${limit}&offset=${offset}`);
    return response.data.blogs;
  },

  getTopBlogs: async () => {
    const response = await api.get('/api/mobile/blogs/top');
    return response.data.blogs;
  },

  search: async (query: string) => {
    const response = await api.get(`/api/mobile/search?q=${encodeURIComponent(query)}`);
    return response.data.results;
  },

  getTrending: async () => {
    const response = await api.get('/api/mobile/search?trending=true');
    return response.data.trending.map((t: any) => t.query);
  },

  getChatMessages: async (limit = 50, before?: string) => {
    const response = await api.get(`/api/mobile/chat?limit=${limit}${before ? `&before=${before}` : ''}`);
    return response.data.messages;
  },

  sendChatMessage: async (content: string, imageUrl?: string, replyToId?: string, mentions: string[] = []) => {
    const response = await api.post('/api/mobile/chat', { content, imageUrl, replyToId, mentions });
    return response.data;
  }
};

async function saveSession(data: any) {
  const token = data.session.token;
  const user = data.user;
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));
}

async function clearSession() {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
}

export default api;
