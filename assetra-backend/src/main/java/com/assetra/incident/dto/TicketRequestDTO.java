package com.assetra.incident.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class TicketRequestDTO {
    private UUID resourceId;
    private String category;
    private String description;
    private String priority;
    private String contactDetails;
    private String userName; // ← NEW
}