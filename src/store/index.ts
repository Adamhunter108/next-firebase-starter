import { create } from "zustand";
import { User as FirebaseUser } from "firebase/auth";

interface UserState {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  setUser: (user: FirebaseUser) => void;
  clearUser: () => void;
  initializeUser: () => void;
}

const useStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    if (typeof window !== "undefined") {
      document.cookie = `user=${JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      })}; path=/; max-age=${7 * 24 * 60 * 60}`;
    }
  },
  clearUser: () => {
    set({ user: null, isAuthenticated: false });
    if (typeof window !== "undefined") {
      document.cookie = `user=; path=/; max-age=0`;
    }
  },
  initializeUser: () => {
    if (get().user) return; // Prevent re-initialization if user is already set
    if (typeof window !== "undefined") {
      const userCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user="));
      if (userCookie) {
        const parsedUser = JSON.parse(userCookie.split("=")[1]);
        // Simulate a FirebaseUser object
        const user: FirebaseUser = {
          ...parsedUser,
          providerId: "",
          emailVerified: false,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: "",
          tenantId: "",
          delete: async () => {},
          getIdToken: async (forceRefresh) => "",
          getIdTokenResult: async (forceRefresh) => ({} as any),
          reload: async () => {},
          toJSON: () => ({} as any),
        } as FirebaseUser;
        set({ user, isAuthenticated: true });
      }
    }
  },
}));

export default useStore;
