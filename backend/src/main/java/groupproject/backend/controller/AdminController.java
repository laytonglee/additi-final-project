package groupproject.backend.controller;

import groupproject.backend.model.Project;
import groupproject.backend.model.Role;
import groupproject.backend.model.User;
import groupproject.backend.repository.ProposalRepository;
import groupproject.backend.response.AdminStatsResponse;
import groupproject.backend.response.AdminUserResponse;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.response.ProjectResponse;
import groupproject.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ProposalRepository proposalRepository;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getUsers() {
        List<User> users = adminService.getAllUsers();
        List<AdminUserResponse> response = users.stream()
                .map(this::toUserResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(response, "Users retrieved"));
    }

    @GetMapping("/users/search")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> searchUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean banned,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<User> users = adminService.searchUsers(search, role, banned,
                PageRequest.of(page, size, Sort.by("id").ascending()));
        Page<AdminUserResponse> response = users.map(this::toUserResponse);
        return ResponseEntity.ok(ApiResponse.success(response, "Users retrieved"));
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<ApiResponse<Void>> toggleBan(@PathVariable Long id) {
        adminService.toggleBan(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User ban status toggled"));
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getProjects(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Project> projects = adminService.searchProjects(keyword, status,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        Page<ProjectResponse> response = projects.map(this::toProjectResponse);
        return ResponseEntity.ok(ApiResponse.success(response, "Projects retrieved"));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        adminService.forceDeleteProject(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Project force-deleted"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStats(), "Platform stats"));
    }

    private AdminUserResponse toUserResponse(User u) {
        return AdminUserResponse.builder()
                .id(u.getId())
                .name(u.getRealName())
                .email(u.getEmail())
                .isBanned(u.isBanned())
                .enabled(u.isEnabled())
                .roles(u.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .avatarUrl(u.getAvatarUrl())
                .build();
    }

    private ProjectResponse toProjectResponse(Project p) {
        return ProjectResponse.builder()
                .id(p.getId())
                .clientId(p.getClient().getId())
                .clientName(p.getClient().getRealName())
                .assignedFreelancerId(p.getAssignedFreelancer() != null ? p.getAssignedFreelancer().getId() : null)
                .assignedFreelancerName(p.getAssignedFreelancer() != null ? p.getAssignedFreelancer().getRealName() : null)
                .title(p.getTitle())
                .description(p.getDescription())
                .category(p.getCategory())
                .projectType(p.getProjectType() != null ? p.getProjectType().name() : null)
                .experienceLevel(p.getExperienceLevel() != null ? p.getExperienceLevel().name() : null)
                .budgetMin(p.getBudgetMin())
                .budgetMax(p.getBudgetMax())
                .status(p.getStatus().name())
                .deadline(p.getDeadline())
                .viewCount(p.getViewCount())
                .proposalCount(proposalRepository.countByProjectId(p.getId()))
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
