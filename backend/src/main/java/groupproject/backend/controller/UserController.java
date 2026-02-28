package groupproject.backend.controller;

import groupproject.backend.model.Review;
import groupproject.backend.model.User;
import groupproject.backend.repository.UserRepository;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.response.ReviewResponse;
import groupproject.backend.response.UserProfileResponse;
import groupproject.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final ReviewService reviewService;

    @GetMapping("/api/users/{id}/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfile(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Review> reviews = reviewService.getByUser(id);

        double avgRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        List<ReviewResponse> reviewResponses = reviews.stream()
                .map(r -> ReviewResponse.builder()
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
                        .build())
                .collect(Collectors.toList());

        UserProfileResponse profile = UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getRealName())
                .bio(user.getBio())
                .skills(user.getSkills())
                .avatarUrl(user.getAvatarUrl())
                .roles(user.getRoles().stream()
                        .map(role -> "ROLE_" + role.getName())
                        .collect(Collectors.toSet()))
                .averageRating(avgRating)
                .reviewCount(reviews.size())
                .isOnline(user.isOnline())
                .reviews(reviewResponses)
                .build();

        return ResponseEntity.ok(ApiResponse.success(profile, "User profile fetched"));
    }
}
