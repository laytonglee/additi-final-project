package groupproject.backend.service.impl;

import groupproject.backend.model.Contract;
import groupproject.backend.model.Message;
import groupproject.backend.model.User;
import groupproject.backend.model.enums.NotificationType;
import groupproject.backend.model.enums.ReferenceType;
import groupproject.backend.repository.ContractRepository;
import groupproject.backend.repository.MessageRepository;
import groupproject.backend.request.SendMessageRequest;
import groupproject.backend.service.MessageService;
import groupproject.backend.service.NotificationService;
import groupproject.backend.response.MessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ContractRepository contractRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public Page<Message> getByContract(Long contractId, User user, Pageable pageable) {
        Contract contract = getContractAndValidateParty(contractId, user);
        return messageRepository.findByContractIdOrderByCreatedAtAsc(contractId, pageable);
    }

    @Override
    @Transactional
    public Message send(Long contractId, SendMessageRequest request, User sender) {
        Contract contract = getContractAndValidateParty(contractId, sender);

        User receiver = contract.getClient().getId().equals(sender.getId())
                ? contract.getFreelancer()
                : contract.getClient();

        Message msg = new Message();
        msg.setThreadId(contractId); // use contract ID as thread ID
        msg.setContract(contract);
        msg.setSender(sender);
        msg.setReceiver(receiver);
        msg.setBody(request.getBody());
        msg.setAttachmentUrl(request.getAttachmentUrl());
        Message saved = messageRepository.save(msg);

        // Build response DTO for WebSocket broadcast
        MessageResponse wsPayload = MessageResponse.builder()
                .id(saved.getId())
                .threadId(saved.getThreadId())
                .contractId(saved.getContract().getId())
                .senderId(saved.getSender().getId())
                .senderName(saved.getSender().getRealName())
                .senderAvatarUrl(saved.getSender().getAvatarUrl())
                .receiverId(saved.getReceiver().getId())
                .body(saved.getBody())
                .attachmentUrl(saved.getAttachmentUrl())
                .isRead(saved.isRead())
                .readAt(saved.getReadAt())
                .createdAt(saved.getCreatedAt())
                .build();

        // Broadcast to the contract's chat topic so both parties receive it in real time
        messagingTemplate.convertAndSend("/topic/contracts/" + contractId + "/messages", wsPayload);

        notificationService.create(
                receiver,
                NotificationType.NEW_MESSAGE,
                "New Message",
                sender.getRealName() + " sent you a message in \"" + contract.getProject().getTitle() + "\"",
                contractId,
                ReferenceType.CONTRACT
        );

        return saved;
    }

    @Override
    @Transactional
    public void markAsRead(Long contractId, User user) {
        getContractAndValidateParty(contractId, user);
        messageRepository.markAllAsRead(contractId, user.getId());
    }

    @Override
    public long countUnread(User user) {
        return messageRepository.countUnreadByReceiver(user.getId());
    }

    private Contract getContractAndValidateParty(Long contractId, User user) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found"));

        if (!contract.getClient().getId().equals(user.getId()) &&
                !contract.getFreelancer().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a party of this contract");
        }

        return contract;
    }
}
