import { create } from "zustand";

import type { AuthUser, ApplicationMode } from "../features/auth/types/authUser.js";

interface AuthState {
  user: AuthUser | null;
  activeMode: ApplicationMode;
  setUser: (user: AuthUser) => void;
  setActiveMode: (mode: ApplicationMode) => void;
  clearAuth: () => void;
  isAuthLoading: boolean;
  setAuthLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  activeMode: "USER",
  isAuthLoading: true,
  setAuthLoading: (loading) => set({ isAuthLoading: loading }),
  setUser: (user) =>
    set({
      user,
      activeMode: user.activeMode ?? "USER",
    }),
  setActiveMode: (mode) =>
    set((state) => ({
      activeMode: mode,
      user: state.user ? { ...state.user, activeMode: mode } : null,
    })),
  clearAuth: () => set({ user: null, activeMode: "USER" }),
}));

// Expose store for debugging in development
declare global {
  interface Window {
    authStore: typeof useAuthStore;
  }
}

if (import.meta.env.DEV) { window.authStore = useAuthStore; }