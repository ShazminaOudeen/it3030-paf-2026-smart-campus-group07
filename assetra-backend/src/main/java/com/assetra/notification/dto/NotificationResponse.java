package com.assetra.notification.dto;

import com.assetra.shared.enums.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
    UUID id,
    NotificationType type,
    String message,
    boolean read,
    UUID referenceId,
    String referenceType,
    LocalDateTime createdAt
) {}