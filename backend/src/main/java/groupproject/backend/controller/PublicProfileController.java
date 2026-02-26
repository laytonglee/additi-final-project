package groupproject.backend.controller;

import groupproject.backend.response.ApiResponse;
import groupproject.backend.response.PublicProfileResponse;
import groupproject.backend.service.LinkService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/public")
public class PublicProfileController {

    private final LinkService linkService;

    public PublicProfileController(LinkService linkService) {
        this.linkService = linkService;
    }

    /**
     * Get public profile data for a user.
     */
    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<PublicProfileResponse>> getPublicProfile(
            @PathVariable String username) {
        PublicProfileResponse profile = linkService.getPublicProfile(username);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile retrieved successfully"));
    }

    /**
     * Track a link click and redirect the visitor to the destination URL.
     * This endpoint is called when a visitor clicks a link on the public profile page.
     */
    @GetMapping("/click/{linkId}")
    public void trackClick(
            @PathVariable Long linkId,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        String userAgent = request.getHeader("User-Agent");
        String referrer = request.getHeader("Referer");

        String redirectUrl = linkService.trackClickAndGetUrl(linkId, userAgent, referrer);
        response.sendRedirect(redirectUrl);
    }

    /**
     * Track a profile page view. Called by the frontend when a visitor opens a public profile.
     */
    @PostMapping("/{username}/view")
    public ResponseEntity<ApiResponse<Void>> trackView(
            @PathVariable String username,
            HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        String referrer = request.getHeader("Referer");
        linkService.trackProfileView(username, userAgent, referrer);
        return ResponseEntity.ok(ApiResponse.success(null, "View tracked"));
    }
}
