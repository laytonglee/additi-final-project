package groupproject.backend.service;

import groupproject.backend.response.AdminDashboardResponse;
import groupproject.backend.response.ApiResponse;

public interface AdminService {

    ApiResponse<AdminDashboardResponse> getDashboard();

    ApiResponse<Void> toggleUser(Long userId, boolean enabled);
}
