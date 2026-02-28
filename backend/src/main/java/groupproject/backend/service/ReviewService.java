package groupproject.backend.service;

import groupproject.backend.model.Review;
import groupproject.backend.model.User;
import groupproject.backend.request.CreateReviewRequest;
import groupproject.backend.request.ReplyReviewRequest;

import java.util.List;

public interface ReviewService {
    Review create(Long contractId, CreateReviewRequest request, User reviewer);
    Review reply(Long reviewId, ReplyReviewRequest request, User reviewee);
    List<Review> getByUser(Long userId);
}
