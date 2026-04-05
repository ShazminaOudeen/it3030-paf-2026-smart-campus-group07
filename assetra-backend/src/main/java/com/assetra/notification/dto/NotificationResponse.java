package com.assetra.notification.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class NotificationResponse {
    private UUID id;
    private UUID userId;
    private String type;
    private String message;
    private Boolean isRead;
    private UUID referenceId;
    private String referenceType;
    private LocalDateTime createdAt;
}