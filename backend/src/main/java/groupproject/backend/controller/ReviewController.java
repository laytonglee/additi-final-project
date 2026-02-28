package groupproject.backend.controller;

import groupproject.backend.model.Review;
import groupproject.backend.model.User;
import groupproject.backend.request.CreateReviewRequest;
import groupproject.backend.request.ReplyReviewRequest;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.response.ReviewResponse;
import groupproject.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/api/contracts/{id}/review")
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
            @PathVariable Long id,
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal User user) {
        Review r = reviewService.create(id, request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toResponse(r), "Review submitted"));
    }

    @PutMapping("/api/reviews/{id}/reply")
    public ResponseEntity<ApiResponse<ReviewResponse>> reply(
            @PathVariable Long id,
            @Valid @RequestBody ReplyReviewRequest request,
            @AuthenticationPrincipal User user) {
        Review r = reviewService.reply(id, request, user);
        return ResponseEntity.ok(ApiResponse.success(toResponse(r), "Reply added"));
    }

    @GetMapping("/api/users/{id}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getByUser(@PathVariable Long id) {
        List<Review> reviews = reviewService.getByUser(id);
        return ResponseEntity.ok(ApiResponse.success(
                reviews.stream().map(this::toResponse).toList(), "User reviews"));
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .contractId(r.getContract().getId())
                .reviewerId(r.getReviewer().getId())
                .reviewerName(r.getReviewer().getRealName())
                .reviewerAvatarUrl(r.getReviewer().getAvatarUrl())
                .revieweeId(r.getReviewee().getId())
                .revieweeName(r.getReviewee().getRealName())
                .rating(r.getRating())
                .comment(r.getComment())
                .isPublic(r.isPublic())
                .reply(r.getReply())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
