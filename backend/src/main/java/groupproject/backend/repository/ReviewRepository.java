package groupproject.backend.repository;

import groupproject.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByRevieweeIdAndIsPublicTrueOrderByCreatedAtDesc(Long revieweeId);

    Optional<Review> findByContractId(Long contractId);

    boolean existsByContractId(Long contractId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId AND r.isPublic = true")
    Double averageRatingByReviewee(@Param("userId") Long userId);

    long countByRevieweeId(Long revieweeId);
}
