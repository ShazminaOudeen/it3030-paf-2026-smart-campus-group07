package com.assetra.notification.service;

import com.assetra.shared.enums.NotificationType;

import java.util.UUID;

public interface NotificationService {

    /**
     * Stub — Member 4 will provide the full implementation.
     * Calling this does nothing until their code is merged.
     */
    void createNotification(
        UUID userId,
        NotificationType type,
        String message,
        UUID referenceId,
        String referenceType
    );
}