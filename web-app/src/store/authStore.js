import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { fetchCurrentUser, logoutUser } from "../lib/auth";

const useAuthStore = create(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isCheckingAuth: true,
      error: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          isCheckingAuth: false,
          error: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) =>
        set({
          error,
          isLoading: false,
          isCheckingAuth: false,
        }),

      checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
          const user = await fetchCurrentUser();
          set({
            user,
            isAuthenticated: !!user,
            isCheckingAuth: false,
            error: null,
          });
          return user;
        } catch (err) {
          set({
            user: null,
            isAuthenticated: false,
            isCheckingAuth: false,
          });
          return null;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        await logoutUser();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },
    }),
    { name: "auth-store" },
  ),
);

export default useAuthStore;
