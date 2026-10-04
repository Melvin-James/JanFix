import { create } from "zustand";

import type { AuthUser } from "../features/auth/types/authUser.js";

interface AuthState {

  user: AuthUser | null;

  setUser: (user: AuthUser) => void;

  clearAuth: () => void;

  isAuthLoading: boolean;

  setAuthLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({

  user: null,

  isAuthLoading: true,

  setAuthLoading: (loading) => set({ isAuthLoading: loading, }),

  setUser: (user) => set({ user, }),

  clearAuth: () => set({ user: null, }),

}));

// Expose store for debugging in development
declare global {
  interface Window {
    authStore: typeof useAuthStore;
  }
}

if (import.meta.env.DEV) { window.authStore = useAuthStore; }