package com.assetra.facility.entity;

import com.assetra.facility.enums.ResourceStatus;
import com.assetra.facility.enums.ResourceType;
import com.assetra.shared.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "resources")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Resource extends BaseEntity {

    @NotBlank(message = "Resource name is required")
    @Size(max = 255)
    @Column(nullable = false)
    private String name;

    @NotNull(message = "Resource type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @Size(max = 255)
    private String location;

    @Size(max = 100)
    @Column(name = "availability_window")
    private String availabilityWindow; // e.g. "08:00-18:00"

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    @Column(nullable = false)
    @Builder.Default
    private Boolean deleted = false;

    @Size(max = 1000)
    private String description;

    @Size(max = 500)
    private String imageUrl;
}
