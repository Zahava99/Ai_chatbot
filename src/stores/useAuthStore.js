import { create } from "zustand";
import { getAccessToken } from "@/features/auth/api/authUtils";
import { getMe } from "@/features/auth/api/authApi";

const useAuthStore = create((set) => ({
  user: null,
  authReady: false,

  fetchUser: async () => {
    if (!getAccessToken()) {
      set({ user: null, authReady: true });
      return null;
    }
    try {
      const user = await getMe();
      set({ user, authReady: true });
      return user;
    } catch {
      set({ user: null, authReady: true });
      return null;
    }
  },

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null, authReady: true }),
}));

export default useAuthStore;
