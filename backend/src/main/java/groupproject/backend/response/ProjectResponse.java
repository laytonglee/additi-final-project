package groupproject.backend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private Long id;
    private Long clientId;
    private String clientName;
    private String title;
    private String description;
    private String category;
    private BigDecimal budgetMin;
    private BigDecimal budgetMax;
    private String status;
    private LocalDate deadline;
    private int viewCount;
    private long proposalCount;
    private LocalDateTime createdAt;
}
