package groupproject.backend.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ConversationSummaryResponse {

    /** The contract that backs this conversation thread */
    private Long contractId;

    /** Project title for display */
    private String projectTitle;

    /** The other party in the conversation */
    private Long otherUserId;
    private String otherUserName;
    private String otherUserAvatarUrl;

    /** Preview of the last message */
    private String lastMessageBody;
    private LocalDateTime lastMessageAt;

    /** How many unread messages the current user has in this thread */
    private long unreadCount;

    /** Contract status (ACTIVE / COMPLETED) */
    private String contractStatus;
}
