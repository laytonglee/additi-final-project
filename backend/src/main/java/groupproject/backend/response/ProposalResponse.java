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
public class ProposalResponse {
    private Long id;
    private Long projectId;
    private String projectTitle;
    private Long freelancerId;
    private String freelancerName;
    private String freelancerAvatarUrl;
    private String pitchText;
    private BigDecimal offeredPrice;
    private String status;
    private boolean readByClient;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
