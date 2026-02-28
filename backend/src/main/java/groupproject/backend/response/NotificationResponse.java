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
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String body;
    private Long referenceId;
    private String referenceType;
    private boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
