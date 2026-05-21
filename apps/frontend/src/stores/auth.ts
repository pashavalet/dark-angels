import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  admin: { id: string; email: string } | null;
  isAuthenticated: boolean;
  login: (token: string, admin: { id: string; email: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('access_token'),
  admin: null,
  isAuthenticated: !!localStorage.getItem('access_token'),

  login: (token, admin) => {
    localStorage.setItem('access_token', token);
    set({ accessToken: token, admin, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({ accessToken: null, admin: null, isAuthenticated: false });
  },
}));