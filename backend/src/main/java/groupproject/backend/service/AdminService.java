package groupproject.backend.service;

import groupproject.backend.model.User;
import groupproject.backend.response.AdminStatsResponse;

import java.util.List;

public interface AdminService {
    List<User> getAllUsers();
    void toggleBan(Long userId);
    void forceDeleteProject(Long projectId);
    AdminStatsResponse getStats();
}
