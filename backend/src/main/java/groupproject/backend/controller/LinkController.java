package groupproject.backend.controller;

import groupproject.backend.model.User;
import groupproject.backend.repository.UserRepository;
import groupproject.backend.request.CreateLinkRequest;
import groupproject.backend.request.ReorderLinksRequest;
import groupproject.backend.request.UpdateLinkRequest;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.response.LinkResponse;
import groupproject.backend.service.LinkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/links")
public class LinkController {

    private final LinkService linkService;
    private final UserRepository userRepository;

    public LinkController(LinkService linkService, UserRepository userRepository) {
        this.linkService = linkService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LinkResponse>> createLink(
            Authentication authentication,
            @Valid @RequestBody CreateLinkRequest request) {
        User user = getUser(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(linkService.createLink(user, request));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LinkResponse>>> getLinks(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(linkService.getUserLinks(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LinkResponse>> updateLink(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateLinkRequest request) {
        User user = getUser(authentication);
        return ResponseEntity.ok(linkService.updateLink(user, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLink(
            Authentication authentication,
            @PathVariable Long id) {
        User user = getUser(authentication);
        return ResponseEntity.ok(linkService.deleteLink(user, id));
    }

    @PutMapping("/reorder")
    public ResponseEntity<ApiResponse<List<LinkResponse>>> reorderLinks(
            Authentication authentication,
            @Valid @RequestBody ReorderLinksRequest request) {
        User user = getUser(authentication);
        return ResponseEntity.ok(linkService.reorderLinks(user, request));
    }

    private User getUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
