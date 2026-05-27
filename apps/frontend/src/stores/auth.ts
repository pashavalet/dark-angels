import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  admin: { id: string; email: string } | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  accessLevel: string;
  telegramUserId: number | null;
  telegramUsername: string | null;
  isSubscribed: boolean;
  isAdmin: boolean;
  login: (token: string, admin: { id: string; email: string }) => void;
  logout: () => void;
  setAccess: (level: string, premium: boolean) => void;
  updateEmail: (email: string) => void;
  setTelegramAuth: (userId: number, username: string | null, subscribed: boolean, admin?: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('access_token'),
  admin: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isPremium: false,
  accessLevel: 'public',
  telegramUserId: null,
  telegramUsername: null,
  isSubscribed: false,
  isAdmin: false,

  login: (token, admin) => {
    localStorage.setItem('access_token', token);
    set({ accessToken: token, admin, isAuthenticated: true, isAdmin: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({ accessToken: null, admin: null, isAuthenticated: false, isPremium: false, accessLevel: 'public', telegramUserId: null, telegramUsername: null, isSubscribed: false, isAdmin: false });
  },

  setAccess: (level, premium) => {
    set({ accessLevel: level, isPremium: premium });
  },

  updateEmail: (email) => set((state) => ({
    admin: state.admin ? { ...state.admin, email } : null,
  })),

  setTelegramAuth: (userId, username, subscribed, admin) => {
    set({ telegramUserId: userId, telegramUsername: username, isSubscribed: subscribed, isAdmin: admin ?? false, accessLevel: subscribed ? 'subscriber' : 'public' });
  },
}));