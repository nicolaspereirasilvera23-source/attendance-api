import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'COACH' | 'STAFF';
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('svc_token'),
  user: JSON.parse(localStorage.getItem('svc_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('svc_token'),

  setAuth: (token, user) => {
    localStorage.setItem('svc_token', token);
    localStorage.setItem('svc_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('svc_token');
    localStorage.removeItem('svc_user');
    set({ token: null, user: null, isAuthenticated: false });
  }
}));
