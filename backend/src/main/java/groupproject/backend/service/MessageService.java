package groupproject.backend.service;

import groupproject.backend.model.Message;
import groupproject.backend.model.User;
import groupproject.backend.request.SendMessageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MessageService {
    Page<Message> getByContract(Long contractId, User user, Pageable pageable);
    Message send(Long contractId, SendMessageRequest request, User sender);
    void markAsRead(Long contractId, User user);
    long countUnread(User user);
}
