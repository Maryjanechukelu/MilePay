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
        if (!user || !token) {
          console.error("setAuth called with invalid data", { user, token });
          return;
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("mp_token", token);

          document.cookie = `mp_token=${token}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `mp_role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
        }

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
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
          document.cookie = "mp_token=; path=/; max-age=0";
          document.cookie = "mp_role=; path=/; max-age=0";
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "mp_user",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : ({
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
          } as unknown as Storage)
      ),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
