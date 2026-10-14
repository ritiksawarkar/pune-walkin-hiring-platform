package com.punewalkin.platform.notification;

import com.punewalkin.platform.user.Role;
import com.punewalkin.platform.user.User;
import com.punewalkin.platform.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Notification notifyUser(String recipientUserId, String title, String message,
                                   NotificationType type, String resourceType, String resourceId, String link) {
        User recipient = userRepository.findById(recipientUserId).orElse(null);
        if (recipient == null) {
            log.warn("Cannot send notification: User not found for ID {}", recipientUserId);
            return null;
        }

        Notification notification = new Notification();
        notification.setId(UUID.randomUUID().toString());
        notification.setRecipient(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(type != null ? type : NotificationType.INFO);
        notification.setResourceType(resourceType);
        notification.setResourceId(resourceId);
        notification.setLink(link);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    @Transactional
    public void notifyAdmins(String title, String message, NotificationType type,
                             String resourceType, String resourceId, String link) {
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .toList();

        for (User admin : admins) {
            notifyUser(admin.getId(), title, message, type, resourceType, resourceId, link);
        }
    }
}
