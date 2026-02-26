package groupproject.backend.controller;

import groupproject.backend.model.User;
import groupproject.backend.repository.UserRepository;
import groupproject.backend.response.AnalyticsResponse;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.response.LinkDetailAnalyticsResponse;
import groupproject.backend.service.AiService;
import groupproject.backend.service.AnalyticsService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AiService aiService;
    private final UserRepository userRepository;

    public AnalyticsController(AnalyticsService analyticsService,
                               AiService aiService,
                               UserRepository userRepository) {
        this.analyticsService = analyticsService;
        this.aiService = aiService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "30") Integer days) {
        User user = getUser(authentication);
        return ResponseEntity.ok(analyticsService.getAnalytics(user, days));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<String>> getAiSuggestions(
            Authentication authentication) {
        User user = getUser(authentication);
        // Use Claude AI for smart suggestions (falls back gracefully on error)
        return ResponseEntity.ok(aiService.getSmartSuggestions(user));
    }

    @GetMapping("/link/{linkId}")
    public ResponseEntity<ApiResponse<LinkDetailAnalyticsResponse>> getLinkDetail(
            Authentication authentication,
            @PathVariable Long linkId,
            @RequestParam(required = false, defaultValue = "30") Integer days) {
        User user = getUser(authentication);
        return ResponseEntity.ok(analyticsService.getLinkDetail(user, linkId, days));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportCsv(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "30") Integer days) {
        User user = getUser(authentication);
        String csv = analyticsService.exportCsv(user, days);
        byte[] csvBytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "linkhub-analytics.csv");
        headers.setContentLength(csvBytes.length);

        return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
    }

    private User getUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
