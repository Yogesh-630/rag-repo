import { create } from 'zustand';
import api from '../services/api';
import { supabase } from '../supabaseClient';
import { joinUserRoom } from '../services/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('collegerag_token');
      const storedUser = localStorage.getItem('collegerag_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          set({
            user: parsedUser,
            token: storedToken,
            isAuthenticated: true,
            isLoading: false,
          });
          joinUserRoom(parsedUser.id || parsedUser._id);

          // Verify token validity in background with the backend
          api.get('/auth/me')
            .then((res) => {
              if (res.data?.user) {
                set({ user: res.data.user });
                localStorage.setItem('collegerag_user', JSON.stringify(res.data.user));
              }
            })
            .catch((err) => {
              if (err.response && err.response.status === 401) {
                localStorage.removeItem('collegerag_token');
                localStorage.removeItem('collegerag_user');
                set({ user: null, token: null, isAuthenticated: false, isLoading: false });
              }
            });
          return;
        } catch (e) {
          localStorage.removeItem('collegerag_token');
          localStorage.removeItem('collegerag_user');
        }
      }

      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  loginWithGoogle: async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        set({ error: 'Google OAuth requires Supabase to be configured. Please sign in with email.' });
        return;
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/chat`,
        },
      });
      if (error) {
        set({ error: error.message });
      }
    } catch (err) {
      set({ error: 'Google sign-in is currently unavailable. Please sign in with your institutional credentials.' });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('collegerag_token', token);
        localStorage.setItem('collegerag_user', JSON.stringify(user));
      }

      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      joinUserRoom(user.id || user._id);
      return { success: true, user };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || err.message?.includes('Network')
          ? 'Cannot connect to server. Please verify backend is running on http://localhost:5000'
          : err.message || 'Invalid email or password.');
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  register: async ({ name, email, password, role, department }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, role, department });
      const { user, token } = res.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('collegerag_token', token);
        localStorage.setItem('collegerag_user', JSON.stringify(user));
      }

      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      joinUserRoom(user.id || user._id);
      return { success: true, user };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || err.message?.includes('Network')
          ? 'Cannot connect to server. Please verify backend is running on http://localhost:5000'
          : err.message || 'Registration failed.');
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('collegerag_token');
      localStorage.removeItem('collegerag_user');
    }
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
