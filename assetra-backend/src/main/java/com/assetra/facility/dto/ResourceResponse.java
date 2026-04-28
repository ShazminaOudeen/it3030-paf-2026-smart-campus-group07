package com.assetra.facility.dto;

import com.assetra.facility.enums.ResourceStatus;
import com.assetra.facility.enums.ResourceType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

//response

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ResourceResponse {

    private UUID id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String availabilityWindow;
    private ResourceStatus status;
    private String description;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Derived field: populated when fetching with booking context
    private Long activeBookingsCount;
    private Boolean isAvailableNow;
}
