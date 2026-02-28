package groupproject.backend.controller;

import groupproject.backend.model.Role;
import groupproject.backend.model.User;
import groupproject.backend.response.AdminStatsResponse;
import groupproject.backend.response.AdminUserResponse;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getUsers() {
        List<User> users = adminService.getAllUsers();
        List<AdminUserResponse> response = users.stream()
                .map(u -> AdminUserResponse.builder()
                        .id(u.getId())
                        .name(u.getRealName())
                        .email(u.getEmail())
                        .isBanned(u.isBanned())
                        .enabled(u.isEnabled())
                        .roles(u.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                        .avatarUrl(u.getAvatarUrl())
                        .build())
                .toList();
        return ResponseEntity.ok(ApiResponse.success(response, "Users retrieved"));
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<ApiResponse<Void>> toggleBan(@PathVariable Long id) {
        adminService.toggleBan(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User ban status toggled"));
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
}
