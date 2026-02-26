const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (res.status === 302 || res.redirected) {
    window.location.href = res.url;
    return {} as T;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ── Auth ──────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface MeData {
  username: string;
  email: string;
  photo: string | null;
  phoneNumber: string | null;
  address: string | null;
  bio: string | null;
  themeColor: string | null;
  backgroundColor: string | null;
  buttonStyle: string | null;
  roles: string[];
}

export const authApi = {
  register: (body: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) =>
    request<ApiResponse<unknown>>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<ApiResponse<unknown>>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () => request<ApiResponse<MeData>>("/api/auth/me"),

  updateProfile: (body: {
    username?: string;
    bio?: string;
    photo?: string;
    phoneNumber?: string;
    address?: string;
    themeColor?: string;
    backgroundColor?: string;
    buttonStyle?: string;
  }) =>
    request<ApiResponse<MeData>>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  logout: () =>
    request<ApiResponse<void>>("/api/auth/logout", { method: "POST" }),

  refresh: () =>
    request<ApiResponse<void>>("/api/auth/refresh", { method: "POST" }),
};

// ── Links ─────────────────────────────────────────

export interface LinkData {
  id: number;
  title: string;
  url: string;
  platform: string;
  displayOrder: number;
  active: boolean;
  totalClicks: number;
  description: string | null;
  featured: boolean;
  createdAt: string;
}

export const linkApi = {
  getAll: () => request<ApiResponse<LinkData[]>>("/api/links"),

  create: (body: {
    title: string;
    url: string;
    platform?: string;
    description?: string;
    featured?: boolean;
  }) =>
    request<ApiResponse<LinkData>>("/api/links", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (
    id: number,
    body: {
      title?: string;
      url?: string;
      platform?: string;
      active?: boolean;
      description?: string;
      featured?: boolean;
    },
  ) =>
    request<ApiResponse<LinkData>>(`/api/links/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<ApiResponse<void>>(`/api/links/${id}`, { method: "DELETE" }),

  reorder: (linkIds: number[]) =>
    request<ApiResponse<LinkData[]>>("/api/links/reorder", {
      method: "PUT",
      body: JSON.stringify({ linkIds }),
    }),
};

// ── Public Profile ────────────────────────────────

export interface PublicProfile {
  username: string;
  bio: string | null;
  photo: string | null;
  themeColor: string | null;
  backgroundColor: string | null;
  buttonStyle: string | null;
  links: {
    id: number;
    title: string;
    url: string;
    platform: string;
    description: string | null;
    featured: boolean;
  }[];
}

export const publicApi = {
  getProfile: (username: string) =>
    request<ApiResponse<PublicProfile>>(`/api/public/${username}`),

  getClickUrl: (linkId: number) => `${API_BASE}/api/public/click/${linkId}`,

  trackView: (username: string) =>
    fetch(`${API_BASE}/api/public/${username}/view`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {}),
};

// ── Analytics ─────────────────────────────────────

export interface DailyClickData {
  date: string;
  clicks: number;
}

export interface AnalyticsData {
  totalClicks: number;
  totalLinks: number;
  totalViews: number;
  ctr: number;
  clicksPerLink: Record<string, number>;
  clicksPerDevice: Record<string, number>;
  clicksPerBrowser: Record<string, number>;
  clicksPerReferrer: Record<string, number>;
  clicksPerDay: DailyClickData[];
  viewsPerDay: DailyClickData[];
  clicksPerHour: Record<number, number>;
  clicksPerDayOfWeek: Record<number, number>;
  linkPerformance: LinkPerformance[];
}

export interface LinkPerformance {
  linkId: number;
  title: string;
  platform: string;
  clicks: number;
  featured: boolean;
  status: "hot" | "warm" | "cold" | "frozen";
}

export interface ClickDetail {
  id: number;
  clickedAt: string;
  deviceType: string;
  browser: string;
  referrer: string | null;
  country: string | null;
}

export interface LinkDetailData {
  linkId: number;
  title: string;
  url: string;
  platform: string;
  active: boolean;
  totalClicks: number;
  createdAt: string;
  clicksPerDevice: Record<string, number>;
  clicksPerBrowser: Record<string, number>;
  clicksPerReferrer: Record<string, number>;
  clicksPerDay: DailyClickData[];
  clicksPerHour: Record<number, number>;
  clicksPerDayOfWeek: Record<number, number>;
  recentClicks: ClickDetail[];
}

export const analyticsApi = {
  get: (days = 30) =>
    request<ApiResponse<AnalyticsData>>(`/api/analytics?days=${days}`),

  getSuggestions: () =>
    request<ApiResponse<string>>("/api/analytics/suggestions"),

  getLinkDetail: (linkId: number, days = 30) =>
    request<ApiResponse<LinkDetailData>>(
      `/api/analytics/link/${linkId}?days=${days}`,
    ),

  exportCsvUrl: (days = 30) => `${API_BASE}/api/analytics/export?days=${days}`,
};

// ── Admin ─────────────────────────────────────────

export interface AdminUserItem {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  roles: string[];
  linkCount: number;
  clickCount: number;
  photo: string | null;
}

export interface AdminDashboard {
  totalUsers: number;
  totalLinks: number;
  totalClicks: number;
  users: AdminUserItem[];
}

export const adminApi = {
  getDashboard: () =>
    request<ApiResponse<AdminDashboard>>("/api/admin/dashboard"),

  toggleUser: (userId: number, enabled: boolean) =>
    request<ApiResponse<void>>(
      `/api/admin/users/${userId}/toggle?enabled=${enabled}`,
      { method: "PUT" },
    ),
};

// ── AI (Spring AI + Gemini) ──────────────────────────

export const aiApi = {
  getSuggestions: () => request<ApiResponse<string>>("/api/ai/suggestions"),

  generateBio: () => request<ApiResponse<string>>("/api/ai/generate-bio"),

  optimizeTitle: (linkId: number) =>
    request<ApiResponse<string>>(`/api/ai/optimize-title/${linkId}`),

  recommendPlatforms: () =>
    request<ApiResponse<string>>("/api/ai/recommend-platforms"),
};
