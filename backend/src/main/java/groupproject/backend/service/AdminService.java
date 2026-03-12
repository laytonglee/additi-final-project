package groupproject.backend.service;

import groupproject.backend.model.Project;
import groupproject.backend.model.User;
import groupproject.backend.model.enums.ProjectStatus;
import groupproject.backend.response.AdminStatsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminService {
    List<User> getAllUsers();
    Page<User> searchUsers(String search, String role, Boolean banned, Pageable pageable);
    void toggleBan(Long userId);
    Page<Project> searchProjects(String keyword, String status, Pageable pageable);
    void forceDeleteProject(Long projectId);
    AdminStatsResponse getStats();
}
