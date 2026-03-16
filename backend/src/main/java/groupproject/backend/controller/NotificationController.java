package groupproject.backend.controller;

import groupproject.backend.model.Message;
import groupproject.backend.model.Notification;
import groupproject.backend.model.Proposal;
import groupproject.backend.model.User;
import groupproject.backend.model.enums.ReferenceType;
import groupproject.backend.repository.MessageRepository;
import groupproject.backend.repository.ProposalRepository;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.response.NotificationResponse;
import groupproject.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final ProposalRepository proposalRepository;
    private final MessageRepository messageRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User user) {
        Page<Notification> notifications = notificationService.getByUser(
                user.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(
                notifications.map(this::toResponse), "Notifications retrieved"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> unreadCount(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.countUnread(user.getId()), "Unread count"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Integer>> markAllRead(
            @AuthenticationPrincipal User user) {
        int updated = notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success(updated, "All notifications marked as read"));
    }

    private NotificationResponse toResponse(Notification n) {
        Long refId = n.getReferenceId();
        String refType = n.getReferenceType() != null ? n.getReferenceType().name() : null;

        // Resolve old PROPOSAL references to PROJECT so the frontend can link to the project page
        if (n.getReferenceType() == ReferenceType.PROPOSAL && refId != null) {
            Proposal proposal = proposalRepository.findById(refId).orElse(null);
            if (proposal != null) {
                refId = proposal.getProject().getId();
                refType = ReferenceType.PROJECT.name();
            }
        }

        // Resolve old MESSAGE references to CONTRACT so the frontend links to /contracts/{contractId}
        if (n.getReferenceType() == ReferenceType.MESSAGE && refId != null) {
            Message message = messageRepository.findById(refId).orElse(null);
            if (message != null) {
                refId = message.getContract().getId();
                refType = ReferenceType.CONTRACT.name();
            }
        }

        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType().name())
                .title(n.getTitle())
                .body(n.getBody())
                .referenceId(refId)
                .referenceType(refType)
                .isRead(n.isRead())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
