package com.assetra.notification.service;

import com.assetra.notification.dto.NotificationResponse;
import java.util.List;
import java.util.UUID;

public interface NotificationService {
    List<NotificationResponse> getUserNotifications(UUID userId);
    long getUnreadCount(UUID userId);
    void markAsRead(UUID notificationId);
    void markAllAsRead(UUID userId);
    void deleteNotification(UUID notificationId);
    NotificationResponse createNotification(UUID userId, String type, String message, UUID referenceId, String referenceType);
}