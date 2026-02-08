import { create } from 'zustand';
import type { User } from '@shopwise/shared';
import { mockUser } from '@/data/mock-users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  loginWithGoogle: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: mockUser,
  isAuthenticated: true,
  login: () => set({ user: mockUser, isAuthenticated: true }),
  loginWithGoogle: () => set({ user: mockUser, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
