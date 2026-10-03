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

if (import.meta.env.DEV) { (window as any).authStore = useAuthStore; }