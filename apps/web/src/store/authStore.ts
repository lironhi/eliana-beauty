import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone?: string; locale?: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await api.login(email, password);
        // Store access token in memory (API client)
        api.setAccessToken(response.access_token);
        set({
          user: response.user,
          isAuthenticated: true,
        });
      },

      register: async (data) => {
        const response = await api.register(data);
        // Store access token in memory (API client)
        api.setAccessToken(response.access_token);
        set({
          user: response.user,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        try {
          // Call logout endpoint to revoke refresh token
          await api.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout error:', error);
        }
        // Clear access token from memory
        api.setAccessToken(null);
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        try {
          const user = await api.getMe();
          set({ user, isAuthenticated: true });
        } catch (error) {
          api.setAccessToken(null);
          set({ user: null, isAuthenticated: false });
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      // Only persist user info, not tokens
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
