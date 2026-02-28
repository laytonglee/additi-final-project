package groupproject.backend.controller;

import groupproject.backend.model.Contract;
import groupproject.backend.model.Message;
import groupproject.backend.model.User;
import groupproject.backend.repository.ContractRepository;
import groupproject.backend.repository.MessageRepository;
import groupproject.backend.request.SendMessageRequest;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.response.ConversationSummaryResponse;
import groupproject.backend.response.MessageResponse;
import groupproject.backend.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final ContractRepository contractRepository;
    private final MessageRepository messageRepository;

    @GetMapping("/api/contracts/{id}/messages")
    public ResponseEntity<ApiResponse<Page<MessageResponse>>> getMessages(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal User user) {
        Page<Message> messages = messageService.getByContract(id, user, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(messages.map(this::toResponse), "Messages retrieved"));
    }

    @PostMapping("/api/contracts/{id}/messages")
    public ResponseEntity<ApiResponse<MessageResponse>> send(
            @PathVariable Long id,
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal User user) {
        Message msg = messageService.send(id, request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toResponse(msg), "Message sent"));
    }

    @PutMapping("/api/contracts/{id}/messages/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        messageService.markAsRead(id, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Messages marked as read"));
    }

    @GetMapping("/api/messages/unread-count")
    public ResponseEntity<ApiResponse<Long>> unreadCount(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(messageService.countUnread(user), "Unread count"));
    }

    /**
     * Returns a conversation summary for every contract the authenticated user is part of.
     * Each summary includes the other party's info, last message preview, and unread count.
     */
    @GetMapping("/api/messages/conversations")
    public ResponseEntity<ApiResponse<List<ConversationSummaryResponse>>> getConversations(
            @AuthenticationPrincipal User user) {

        List<Contract> contracts = contractRepository.findByClientOrFreelancer(user);

        List<ConversationSummaryResponse> summaries = contracts.stream().map(contract -> {
            // Determine the other party
            User other = contract.getClient().getId().equals(user.getId())
                    ? contract.getFreelancer()
                    : contract.getClient();

            // Get the latest message in this contract thread
            List<Message> latest = messageRepository.findLatestByContractId(
                    contract.getId(), PageRequest.of(0, 1));
            Message lastMsg = latest.isEmpty() ? null : latest.get(0);

            // Count unread messages for the current user in this thread
            long unread = messageRepository.countUnreadByContractAndReceiver(
                    contract.getId(), user.getId());

            return ConversationSummaryResponse.builder()
                    .contractId(contract.getId())
                    .projectTitle(contract.getProject().getTitle())
                    .otherUserId(other.getId())
                    .otherUserName(other.getRealName())
                    .otherUserAvatarUrl(other.getAvatarUrl())
                    .lastMessageBody(lastMsg != null ? lastMsg.getBody() : null)
                    .lastMessageAt(lastMsg != null ? lastMsg.getCreatedAt() : contract.getStartedAt())
                    .unreadCount(unread)
                    .contractStatus(contract.getStatus().name())
                    .build();
        }).sorted((a, b) -> b.getLastMessageAt().compareTo(a.getLastMessageAt()))
          .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(summaries, "Conversations retrieved"));
    }

    private MessageResponse toResponse(Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .threadId(m.getThreadId())
                .contractId(m.getContract().getId())
                .senderId(m.getSender().getId())
                .senderName(m.getSender().getRealName())
                .senderAvatarUrl(m.getSender().getAvatarUrl())
                .receiverId(m.getReceiver().getId())
                .body(m.getBody())
                .attachmentUrl(m.getAttachmentUrl())
                .isRead(m.isRead())
                .readAt(m.getReadAt())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
