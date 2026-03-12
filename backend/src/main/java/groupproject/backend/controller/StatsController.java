package groupproject.backend.controller;

import groupproject.backend.response.AdminStatsResponse;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getPublicStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStats(), "Platform stats"));
    }
}
