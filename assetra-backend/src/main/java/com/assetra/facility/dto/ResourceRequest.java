package com.assetra.facility.dto;

import com.assetra.facility.enums.ResourceStatus;
import com.assetra.facility.enums.ResourceType;
import jakarta.validation.constraints.*;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ResourceRequest {

    @NotBlank(message = "Resource name is required")
    @Size(max = 255, message = "Name must be under 255 characters")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @Size(max = 255)
    private String location;

    @Pattern(
        regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$",
        message = "Availability window must be in format HH:mm-HH:mm"
    )
    private String availabilityWindow;

    private ResourceStatus status;

    @Size(max = 1000, message = "Description must be under 1000 characters")
    private String description;

    @Size(max = 500)
    private String imageUrl;
}
