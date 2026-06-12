"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("mp_token", token);
        }
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      updateUser: (updates) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...updates } });
        }
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("mp_token");
          localStorage.removeItem("mp_user");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "mp_user",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return localStorage;

        // Server-side / test-safe no-op storage that implements the full Storage interface
        const noopStorage: Storage = {
          getItem: (_: string) => null,
          setItem: (_: string, __: string) => undefined,
          removeItem: (_: string) => undefined,
          clear: () => undefined,
          key: (_: number) => null,
          length: 0,
        };

        return noopStorage;
      }),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
