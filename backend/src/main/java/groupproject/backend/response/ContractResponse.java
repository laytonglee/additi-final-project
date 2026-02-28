package groupproject.backend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractResponse {
    private Long id;
    private Long projectId;
    private String projectTitle;
    private Long freelancerId;
    private String freelancerName;
    private Long clientId;
    private String clientName;
    private BigDecimal agreedPrice;
    private String status;
    private String completedNote;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private boolean hasReview;
}
