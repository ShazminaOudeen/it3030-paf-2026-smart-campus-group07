package com.assetra.notification.service;

import com.assetra.notification.dto.NotificationResponse;
import com.assetra.notification.entity.Notification;
import com.assetra.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public List<NotificationResponse> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public void markAsRead(UUID notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    @Override
    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    public void deleteNotification(UUID notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @Override
    public NotificationResponse createNotification(UUID userId, String type, String message, UUID referenceId, String referenceType) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setType(type);
        n.setMessage(message);
        n.setReferenceId(referenceId);
        n.setReferenceType(referenceType);
        return toResponse(notificationRepository.save(n));
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setId(n.getId());
        r.setUserId(n.getUserId());
        r.setType(n.getType());
        r.setMessage(n.getMessage());
        r.setIsRead(n.getIsRead());
        r.setReferenceId(n.getReferenceId());
        r.setReferenceType(n.getReferenceType());
        r.setCreatedAt(n.getCreatedAt());
        return r;
    }
}