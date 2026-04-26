package com.assetra.notification.service;

import com.assetra.notification.dto.NotificationResponse;
import com.assetra.shared.enums.NotificationType;

import java.util.List;
import java.util.UUID;

public interface NotificationService {

    /** Called by BookingServiceImpl and TicketService to fire a notification */
    void createNotification(
        UUID userId,
        NotificationType type,
        String message,
        UUID referenceId,
        String referenceType
    );

    /** Get all notifications for a user, newest first */
    List<NotificationResponse> getNotificationsForUser(UUID userId);

    /** Count unread notifications for a user */
    long countUnread(UUID userId);

    /** Mark a single notification as read */
    NotificationResponse markAsRead(UUID notificationId, UUID userId);

    /** Mark all notifications as read for a user */
    void markAllAsRead(UUID userId);

    /** Delete a notification */
    void deleteNotification(UUID notificationId, UUID userId);
}