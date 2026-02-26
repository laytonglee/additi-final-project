package groupproject.backend.controller;

import groupproject.backend.response.AdminDashboardResponse;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @PutMapping("/users/{userId}/toggle")
    public ResponseEntity<ApiResponse<Void>> toggleUser(
            @PathVariable Long userId,
            @RequestParam boolean enabled) {
        return ResponseEntity.ok(adminService.toggleUser(userId, enabled));
    }
}
