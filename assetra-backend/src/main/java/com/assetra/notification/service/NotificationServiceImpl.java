package com.assetra.notification.service;

import com.assetra.shared.enums.NotificationType;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Temporary stub — Member 4 will replace this with the real implementation.
 * The @Service annotation is required so Spring can inject it into BookingServiceImpl.
 */
@Service
public class NotificationServiceImpl implements NotificationService {

    @Override
    public void createNotification(
            UUID userId,
            NotificationType type,
            String message,
            UUID referenceId,
            String referenceType) {
        // TODO: Member 4 implements this
        System.out.println("[NOTIFICATION STUB] " + type + " → user:" + userId + " | " + message);
    }
}