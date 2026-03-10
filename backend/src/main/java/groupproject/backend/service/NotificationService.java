package groupproject.backend.service;

import groupproject.backend.model.Notification;
import groupproject.backend.model.User;
import groupproject.backend.model.enums.NotificationType;
import groupproject.backend.model.enums.ReferenceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    Notification create(User user, NotificationType type, String title, String body,
                        Long referenceId, ReferenceType referenceType);
    Page<Notification> getByUser(Long userId, Pageable pageable);
    long countUnread(Long userId);
    void markAsRead(Long notificationId, Long userId);
    int markAllAsRead(Long userId);
}
