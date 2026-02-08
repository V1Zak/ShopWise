import { create } from 'zustand';
import type { User } from '@shopwise/shared';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: !!user, isLoading: false });

      authService.onAuthStateChange((user) => {
        set({ user, isAuthenticated: !!user });
      });
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ error: null, isLoading: true });
    try {
      await authService.signIn(email, password);
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: !!user, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  signUp: async (email, password) => {
    set({ error: null, isLoading: true });
    try {
      await authService.signUp(email, password);
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: !!user, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  loginWithGoogle: async () => {
    set({ error: null });
    try {
      await authService.signInWithGoogle();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  loginWithApple: async () => {
    set({ error: null });
    try {
      await authService.signInWithApple();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authService.signOut();
      set({ user: null, isAuthenticated: false });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  clearError: () => set({ error: null }),
}));
