package com.assetra.incident.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "resource_id")
    private UUID resourceId;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String priority;

    @Column(name = "contact_details", length = 255)
    private String contactDetails;

    @Column(nullable = false, length = 20)
    private String status = "OPEN";

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // ← NEW: for service-level timer
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}