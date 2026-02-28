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
public class MessageResponse {
    private Long id;
    private Long threadId;
    private Long contractId;
    private Long senderId;
    private String senderName;
    private String senderAvatarUrl;
    private Long receiverId;
    private String body;
    private String attachmentUrl;
    private boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
