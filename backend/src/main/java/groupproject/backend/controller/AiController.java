package groupproject.backend.controller;

import groupproject.backend.model.User;
import groupproject.backend.repository.UserRepository;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.service.AiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;
    private final UserRepository userRepository;

    public AiController(AiService aiService, UserRepository userRepository) {
        this.aiService = aiService;
        this.userRepository = userRepository;
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<String>> getSmartSuggestions(
            Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(aiService.getSmartSuggestions(user));
    }

    @GetMapping("/generate-bio")
    public ResponseEntity<ApiResponse<String>> generateBio(
            Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(aiService.generateBio(user));
    }

    @GetMapping("/optimize-title/{linkId}")
    public ResponseEntity<ApiResponse<String>> optimizeTitle(
            Authentication authentication,
            @PathVariable Long linkId) {
        User user = getUser(authentication);
        return ResponseEntity.ok(aiService.optimizeLinkTitle(user, linkId));
    }

    @GetMapping("/recommend-platforms")
    public ResponseEntity<ApiResponse<String>> recommendPlatforms(
            Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(aiService.recommendPlatforms(user));
    }

    private User getUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
