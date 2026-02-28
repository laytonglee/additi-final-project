import { create } from "zustand";
import { authApi, MeData } from "@/lib/api";

interface AuthState {
  user: MeData | null;
  loading: boolean;
  error: string | null;

  // Derived helpers
  isAuthenticated: () => boolean;
  hasRole: (role: string) => boolean;
  isClient: () => boolean;
  isFreelancer: () => boolean;
  isAdmin: () => boolean;

  // Actions
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    role: string;
    password: string;
    confirmPassword: string;
    bio?: string;
    skills?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  isAuthenticated: () => !!get().user,
  hasRole: (role: string) => get().user?.roles?.includes(role) ?? false,
  isClient: () => get().hasRole("CLIENT"),
  isFreelancer: () => get().hasRole("FREELANCER"),
  isAdmin: () => get().hasRole("ADMIN"),

  fetchUser: async () => {
    try {
      set({ loading: true, error: null });
      const res = await authApi.me();
      set({ user: res.data.data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      await authApi.login({ email, password });
      const res = await authApi.me();
      set({ user: res.data.data, loading: false });
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
        code?: string;
      };
      let msg = "Login failed";
      if (axiosErr.code === "ECONNABORTED") {
        msg = "Request timed out. Is the backend server running?";
      } else if (axiosErr.code === "ERR_NETWORK") {
        msg =
          "Cannot reach the server. Make sure the backend is running on port 8080.";
      } else if (axiosErr.response?.data?.message) {
        msg = axiosErr.response.data.message;
      }
      set({ user: null, loading: false, error: msg });
      throw err;
    }
  },

  register: async (data) => {
    try {
      set({ loading: true, error: null });
      await authApi.register(data);
      set({ loading: false });
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
        code?: string;
      };
      let msg = "Registration failed";
      if (axiosErr.code === "ECONNABORTED") {
        msg = "Request timed out. Is the backend server running?";
      } else if (axiosErr.code === "ERR_NETWORK") {
        msg =
          "Cannot reach the server. Make sure the backend is running on port 8080.";
      } else if (axiosErr.response?.data?.message) {
        msg = axiosErr.response.data.message;
      }
      set({ loading: false, error: msg });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, loading: false, error: null });
      // Redirect to login page after logout
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },

  clearError: () => set({ error: null }),
}));
