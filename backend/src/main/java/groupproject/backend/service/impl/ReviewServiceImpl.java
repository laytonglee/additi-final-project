package groupproject.backend.service.impl;

import groupproject.backend.model.Contract;
import groupproject.backend.model.Review;
import groupproject.backend.model.User;
import groupproject.backend.model.enums.ContractStatus;
import groupproject.backend.model.enums.NotificationType;
import groupproject.backend.model.enums.ReferenceType;
import groupproject.backend.repository.ContractRepository;
import groupproject.backend.repository.ReviewRepository;
import groupproject.backend.request.CreateReviewRequest;
import groupproject.backend.request.ReplyReviewRequest;
import groupproject.backend.service.NotificationService;
import groupproject.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ContractRepository contractRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public Review create(Long contractId, CreateReviewRequest request, User reviewer) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found"));

        if (contract.getStatus() != ContractStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contract must be completed before leaving a review");
        }

        if (!contract.getClient().getId().equals(reviewer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the client can leave a review");
        }

        if (reviewRepository.existsByContractId(contractId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Review already exists for this contract");
        }

        Review review = new Review();
        review.setContract(contract);
        review.setReviewer(reviewer);
        review.setReviewee(contract.getFreelancer());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setPublic(true);
        Review saved = reviewRepository.save(review);

        notificationService.create(
                contract.getFreelancer(),
                NotificationType.REVIEW_RECEIVED,
                "New Review",
                reviewer.getRealName() + " left a " + request.getRating() + "-star review for \"" + contract.getProject().getTitle() + "\"",
                saved.getId(),
                ReferenceType.REVIEW
        );

        return saved;
    }

    @Override
    @Transactional
    public Review reply(Long reviewId, ReplyReviewRequest request, User reviewee) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        if (!review.getReviewee().getId().equals(reviewee.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your review to reply to");
        }

        if (review.getReply() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already replied to this review");
        }

        review.setReply(request.getReply());
        reviewRepository.save(review);

        notificationService.create(
                review.getReviewer(),
                NotificationType.REVIEW_REPLIED,
                "Review Reply",
                reviewee.getRealName() + " replied to your review.",
                review.getId(),
                ReferenceType.REVIEW
        );

        return review;
    }

    @Override
    public List<Review> getByUser(Long userId) {
        return reviewRepository.findByRevieweeIdAndIsPublicTrueOrderByCreatedAtDesc(userId);
    }
}
