package groupproject.backend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long contractId;
    private Long reviewerId;
    private String reviewerName;
    private String reviewerAvatarUrl;
    private Long revieweeId;
    private String revieweeName;
    private int rating;
    private String comment;
    private boolean isPublic;
    private String reply;
    private LocalDateTime createdAt;
}
