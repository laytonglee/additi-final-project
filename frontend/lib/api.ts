import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

// Separate axios instance for multipart/form-data (file uploads)
const multipartApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 90000,
});

// Auto-refresh token on 401 (debounced to prevent spam)
let isRefreshing = false;
let failedQueue: {
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
}[] = [];

const processQueue = (error: unknown | null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(undefined);
  });
  failedQueue = [];
};

const attachRefreshInterceptor = (instance: typeof api) => {
  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;

      // Guard: network errors / cancelled requests have no config
      if (!original) {
        return Promise.reject(error);
      }

      const skipRefreshUrls = [
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/refresh",
        "/api/auth/logout",
        "/api/auth/me",
      ];
      if (skipRefreshUrls.some((u) => original.url?.startsWith(u))) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !original._retry) {
        if (isRefreshing) {
          // Queue this request until the ongoing refresh resolves
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            original._retry = true;
            return instance(original);
          });
        }

        original._retry = true;
        isRefreshing = true;

        try {
          await api.post("/api/auth/refresh");
          processQueue(null);
          return instance(original);
        } catch (refreshError) {
          processQueue(refreshError);
          // Both tokens expired — clear auth state only.
          import("@/store/auth")
            .then(({ useAuthStore }) => {
              const { user, loading } = useAuthStore.getState();
              if (!loading && !user) {
                useAuthStore.setState({ user: null, loading: false });
              }
            })
            .catch(() => {});
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    },
  );
};

attachRefreshInterceptor(api);
attachRefreshInterceptor(multipartApi);

export default api;

// ── Types ─────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface MeData {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  skills: string | null;
  avatarUrl: string | null;
  isBanned: boolean;
  isOnline: boolean;
  notifEmail: boolean;
  notifPush: boolean;
  roles: string[];
}

export interface ProjectData {
  id: number;
  clientId: number;
  clientName: string;
  assignedFreelancerId: number | null;
  assignedFreelancerName: string | null;
  title: string;
  description: string;
  category: string;
  projectType: string | null;
  experienceLevel: string | null;
  budgetMin: number;
  budgetMax: number;
  status: string;
  deadline: string;
  viewCount: number;
  proposalCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalData {
  id: number;
  projectId: number;
  projectTitle: string;
  freelancerId: number;
  freelancerName: string;
  freelancerAvatarUrl: string | null;
  pitchText: string;
  offeredPrice: number;
  status: string;
  readByClient: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContractData {
  id: number;
  projectId: number;
  projectTitle: string;
  freelancerId: number;
  freelancerName: string;
  clientId: number;
  clientName: string;
  agreedPrice: number;
  status: string;
  completedNote: string | null;
  startedAt: string;
  completedAt: string | null;
  hasReview: boolean;
}

export interface ReviewData {
  id: number;
  contractId: number;
  reviewerId: number;
  reviewerName: string;
  reviewerAvatarUrl: string | null;
  revieweeId: number;
  revieweeName: string;
  rating: number;
  comment: string;
  isPublic: boolean;
  reply: string | null;
  createdAt: string;
}

export interface MessageData {
  id: number;
  threadId: number;
  contractId: number;
  senderId: number;
  senderName: string;
  senderAvatarUrl: string | null;
  receiverId: number;
  body: string;
  attachmentUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface ConversationSummaryData {
  contractId: number;
  projectTitle: string;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  lastMessageBody: string | null;
  lastMessageAt: string;
  unreadCount: number;
  contractStatus: string;
}

export interface NotificationData {
  id: number;
  type: string;
  title: string;
  body: string;
  referenceId: number;
  referenceType: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface PageData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AdminStatsData {
  totalUsers: number;
  totalProjects: number;
  totalProposals: number;
  totalContracts: number;
}

export interface AdminUserData {
  id: number;
  name: string;
  email: string;
  isBanned: boolean;
  enabled: boolean;
  roles: string[];
  avatarUrl: string | null;
}

export interface CategoryData {
  id: number;
  name: string;
}

export interface UserProfileData {
  id: number;
  name: string;
  bio: string | null;
  skills: string | null;
  avatarUrl: string | null;
  roles: string[];
  averageRating: number | null;
  reviewCount: number;
  isOnline: boolean;
  reviews: ReviewData[];
}

// ── Auth API ──────────────────────────────────────

export const authApi = {
  register: (body: {
    name: string;
    email: string;
    role: string;
    password: string;
    confirmPassword: string;
    bio?: string;
    skills?: string;
  }) => api.post<ApiResponse<unknown>>("/api/auth/register", body),

  login: (body: { email: string; password: string }) =>
    api.post<ApiResponse<unknown>>("/api/auth/login", body),

  me: () => api.get<ApiResponse<MeData>>("/api/auth/me"),

  updateProfile: (body: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    bio?: string;
    skills?: string;
    avatarUrl?: string;
    notifEmail?: boolean;
    notifPush?: boolean;
  }) => api.put<ApiResponse<MeData>>("/api/auth/profile", body),

  logout: () => api.post<ApiResponse<void>>("/api/auth/logout"),

  refresh: () => api.post<ApiResponse<void>>("/api/auth/refresh"),
};

// ── Upload API ────────────────────────────────────

export const uploadApi = {
  /**
   * Upload a profile avatar image to Cloudflare R2.
   * Returns the public URL of the uploaded image.
   */
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return multipartApi.post<ApiResponse<{ url: string }>>(
      "/api/upload/avatar",
      formData,
    );
  },

  /**
   * Upload a message attachment (image, PDF, Word, Excel, text) to Cloudflare R2.
   * Returns the public URL, original file name, and content type.
   */
  uploadAttachment: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return multipartApi.post<
      ApiResponse<{ url: string; fileName: string; contentType: string }>
    >("/api/upload/attachment", formData);
  },
};

// ── Projects API ──────────────────────────────────

export const projectApi = {
  getAll: (page = 0, size = 10) =>
    api.get<ApiResponse<PageData<ProjectData>>>(
      `/api/projects?page=${page}&size=${size}`,
    ),

  getMy: (page = 0, size = 50) =>
    api.get<ApiResponse<PageData<ProjectData>>>(
      `/api/projects/my?page=${page}&size=${size}`,
    ),

  search: (params: {
    keyword?: string;
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    status?: string;
    page?: number;
    size?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.keyword) query.set("keyword", params.keyword);
    if (params.category) query.set("category", params.category);
    if (params.minBudget != null)
      query.set("minBudget", String(params.minBudget));
    if (params.maxBudget != null)
      query.set("maxBudget", String(params.maxBudget));
    if (params.status) query.set("status", params.status);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 10));
    return api.get<ApiResponse<PageData<ProjectData>>>(
      `/api/projects/search?${query}`,
    );
  },

  getById: (id: number) =>
    api.get<ApiResponse<ProjectData>>(`/api/projects/${id}`),

  trackView: (id: number) =>
    api.post<ApiResponse<void>>(`/api/projects/${id}/view`),

  create: (body: {
    title: string;
    description: string;
    category: string;
    projectType?: string;
    experienceLevel?: string;
    budgetMin: number;
    budgetMax: number;
    deadline?: string;
  }) => api.post<ApiResponse<ProjectData>>("/api/projects", body),

  update: (id: number, body: Record<string, unknown>) =>
    api.put<ApiResponse<ProjectData>>(`/api/projects/${id}`, body),

  delete: (id: number) => api.delete<ApiResponse<void>>(`/api/projects/${id}`),
};

// ── Proposals API ─────────────────────────────────

export const proposalApi = {
  submit: (
    projectId: number,
    body: { pitchText: string; offeredPrice: number },
  ) =>
    api.post<ApiResponse<ProposalData>>(
      `/api/projects/${projectId}/proposals`,
      body,
    ),

  getByProject: (projectId: number) =>
    api.get<ApiResponse<ProposalData[]>>(
      `/api/projects/${projectId}/proposals`,
    ),

  getMy: () => api.get<ApiResponse<ProposalData[]>>("/api/proposals/my"),

  accept: (id: number) =>
    api.put<ApiResponse<ProposalData>>(`/api/proposals/${id}/accept`),

  reject: (id: number) =>
    api.put<ApiResponse<ProposalData>>(`/api/proposals/${id}/reject`),
};

// ── Contracts API ─────────────────────────────────

export const contractApi = {
  getMy: () => api.get<ApiResponse<ContractData[]>>("/api/contracts/my"),

  getById: (id: number) =>
    api.get<ApiResponse<ContractData>>(`/api/contracts/${id}`),

  complete: (id: number, completedNote?: string) =>
    api.put<ApiResponse<ContractData>>(`/api/contracts/${id}/complete`, {
      completedNote,
    }),
};

// ── Reviews API ───────────────────────────────────

export const reviewApi = {
  create: (contractId: number, body: { rating: number; comment: string }) =>
    api.post<ApiResponse<ReviewData>>(
      `/api/contracts/${contractId}/review`,
      body,
    ),

  reply: (reviewId: number, body: { reply: string }) =>
    api.put<ApiResponse<ReviewData>>(`/api/reviews/${reviewId}/reply`, body),

  getByUser: (userId: number) =>
    api.get<ApiResponse<ReviewData[]>>(`/api/users/${userId}/reviews`),
};

// ── Messages API ──────────────────────────────────

export const messageApi = {
  getByContract: (contractId: number, page = 0, size = 50) =>
    api.get<ApiResponse<PageData<MessageData>>>(
      `/api/contracts/${contractId}/messages?page=${page}&size=${size}`,
    ),

  send: (contractId: number, body: { body: string; attachmentUrl?: string }) =>
    api.post<ApiResponse<MessageData>>(
      `/api/contracts/${contractId}/messages`,
      body,
    ),

  markRead: (contractId: number) =>
    api.put<ApiResponse<void>>(`/api/contracts/${contractId}/messages/read`),

  unreadCount: () => api.get<ApiResponse<number>>("/api/messages/unread-count"),

  getConversations: () =>
    api.get<ApiResponse<ConversationSummaryData[]>>(
      "/api/messages/conversations",
    ),
};

// ── Notifications API ─────────────────────────────

export const notificationApi = {
  getAll: (page = 0, size = 6) =>
    api.get<ApiResponse<PageData<NotificationData>>>(
      `/api/notifications?page=${page}&size=${size}`,
    ),

  unreadCount: () =>
    api.get<ApiResponse<number>>("/api/notifications/unread-count"),

  markRead: (id: number) =>
    api.put<ApiResponse<void>>(`/api/notifications/${id}/read`),

  markAllRead: () =>
    api.put<ApiResponse<number>>("/api/notifications/read-all"),
};

// ── Public Stats API ──────────────────────────────

export const statsApi = {
  get: () => api.get<ApiResponse<AdminStatsData>>("/api/stats"),
};

// ── Admin API ─────────────────────────────────────

export const adminApi = {
  getUsers: () => api.get<ApiResponse<AdminUserData[]>>("/api/admin/users"),

  searchUsers: (params: {
    search?: string;
    role?: string;
    banned?: boolean;
    page?: number;
    size?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.role) query.set("role", params.role);
    if (params.banned !== undefined) query.set("banned", String(params.banned));
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 10));
    return api.get<ApiResponse<PageData<AdminUserData>>>(
      `/api/admin/users/search?${query}`,
    );
  },

  toggleBan: (userId: number) =>
    api.put<ApiResponse<void>>(`/api/admin/users/${userId}/ban`),

  getProjects: (params: {
    keyword?: string;
    status?: string;
    page?: number;
    size?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.keyword) query.set("keyword", params.keyword);
    if (params.status) query.set("status", params.status);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 10));
    return api.get<ApiResponse<PageData<ProjectData>>>(
      `/api/admin/projects?${query}`,
    );
  },

  deleteProject: (projectId: number) =>
    api.delete<ApiResponse<void>>(`/api/admin/projects/${projectId}`),

  getStats: () => api.get<ApiResponse<AdminStatsData>>("/api/admin/stats"),
};

// ── Category API ──────────────────────────────────

export const categoryApi = {
  getAll: () => api.get<ApiResponse<CategoryData[]>>("/api/categories"),

  create: (name: string) =>
    api.post<ApiResponse<CategoryData>>("/api/admin/categories", { name }),

  update: (id: number, name: string) =>
    api.put<ApiResponse<CategoryData>>(`/api/admin/categories/${id}`, { name }),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/api/admin/categories/${id}`),
};
