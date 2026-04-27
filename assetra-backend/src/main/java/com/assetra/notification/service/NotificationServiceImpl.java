package com.assetra.notification.service;

import com.assetra.notification.dto.NotificationResponse;
import com.assetra.notification.entity.Notification;
import com.assetra.notification.repository.NotificationRepository;
import com.assetra.shared.enums.NotificationType;
import com.assetra.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    // ── Called by BookingServiceImpl and TicketService to fire notifications ──
    @Override
    @Transactional
    public void createNotification(
            UUID userId,
            NotificationType type,
            String message,
            UUID referenceId,
            String referenceType) {

        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .message(message)
                .read(false)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();

        notificationRepository.save(notification);
    }

    // ── Get all notifications for the logged-in user ──
    @Override
    public List<NotificationResponse> getNotificationsForUser(UUID userId) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── Count unread notifications ──
    @Override
    public long countUnread(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    // ── Mark a single notification as read ──
    @Override
    @Transactional
    public NotificationResponse markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new com.assetra.shared.exception.UnauthorizedException(
                    "You are not authorised to update this notification");
        }

        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    // ── Mark all notifications as read ──
    @Override
    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    // ── Delete a notification ──
    @Override
    @Transactional
    public void deleteNotification(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new com.assetra.shared.exception.UnauthorizedException(
                    "You are not authorised to delete this notification");
        }

        notificationRepository.delete(notification);
    }

    // ── Helper ──
    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getType(),
                n.getMessage(),
                n.isRead(),
                n.getReferenceId(),
                n.getReferenceType(),
                n.getCreatedAt()
        );
    }
}