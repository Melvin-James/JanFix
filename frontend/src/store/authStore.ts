import { create } from "zustand";

import type { AuthUser } from "../features/auth/types/authUser.js";

interface AuthState {

  accessToken: string | null;

  user: AuthUser | null;

  setAuth: (
    token: string,
    user: AuthUser
  ) => void;

  clearAuth: () => void;

  isAuthLoading: boolean;

  setAuthLoading: (
    loading: boolean
  ) => void;
}

export const useAuthStore =

  create<AuthState>((set) => ({

    accessToken: null,

    user: null,

    isAuthLoading: true,

    setAuthLoading:
      (loading) =>

        set({

          isAuthLoading: loading,
        }),

    setAuth:
      (token, user) =>

        set({

          accessToken: token,

          user,
        }),

    clearAuth:
      () =>

        set({

          accessToken: null,

          user: null,
        }),
  }));