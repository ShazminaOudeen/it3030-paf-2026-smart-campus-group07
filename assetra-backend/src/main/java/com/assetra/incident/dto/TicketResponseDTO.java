package com.assetra.incident.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TicketResponseDTO {
    private UUID id;
    private UUID userId;
    private String userName; // ← NEW
    private UUID resourceId;
    private String category;
    private String description;
    private String priority;
    private String contactDetails;
    private String status;
    private String rejectionReason;
    private UUID assignedTo;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime assignedAt;
    private LocalDateTime resolvedAt;
}