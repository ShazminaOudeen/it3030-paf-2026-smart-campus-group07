package com.assetra.facility.service;

import com.assetra.facility.dto.ResourceRequest;
import com.assetra.facility.dto.ResourceResponse;
import com.assetra.facility.entity.Resource;
import com.assetra.facility.enums.ResourceStatus;
import com.assetra.facility.enums.ResourceType;
import com.assetra.facility.repository.ResourceRepository;
import com.assetra.shared.exception.ResourceNotFoundException;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Override
    public Page<ResourceResponse> getAllResources(
            ResourceType type, ResourceStatus status,
            Integer minCapacity, String location, String search,
            Pageable pageable) {

        Specification<Resource> spec = buildSpec(type, status, minCapacity, location, search);
        return resourceRepository.findAll(spec, pageable).map(this::toResponse);
    }

    /**
     * Builds a JPA Specification with only the filters that are actually provided.
     * Avoids the NULL enum comparison bug in JPQL.
     */
    private Specification<Resource> buildSpec(
            ResourceType type, ResourceStatus status,
            Integer minCapacity, String location, String search) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always exclude soft-deleted
            predicates.add(cb.isFalse(root.get("deleted")));

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (minCapacity != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
            }
            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("location")),
                        "%" + location.toLowerCase() + "%"
                ));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    public ResourceResponse getResourceById(UUID id) {
        Resource resource = resourceRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return toResponse(resource);
    }

    @Override
    @Transactional
    public ResourceResponse createResource(ResourceRequest request) {
        log.info("Creating resource: {}", request.getName());
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .availabilityWindow(request.getAvailabilityWindow())
                .status(request.getStatus() != null ? request.getStatus() : ResourceStatus.ACTIVE)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();
        return toResponse(resourceRepository.save(resource));
    }

    @Override
    @Transactional
    public ResourceResponse updateResource(UUID id, ResourceRequest request) {
        Resource resource = resourceRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setAvailabilityWindow(request.getAvailabilityWindow());
        if (request.getStatus() != null) resource.setStatus(request.getStatus());
        resource.setDescription(request.getDescription());
        resource.setImageUrl(request.getImageUrl());

        return toResponse(resourceRepository.save(resource));
    }

    @Override
    @Transactional
    public ResourceResponse updateResourceStatus(UUID id, ResourceStatus status) {
        Resource resource = resourceRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        resource.setStatus(status);
        return toResponse(resourceRepository.save(resource));
    }

    @Override
    @Transactional
    public void deleteResource(UUID id) {
        Resource resource = resourceRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        resource.setDeleted(true);
        resourceRepository.save(resource);
        log.info("Soft-deleted resource: {}", id);
    }

    @Override
    public Map<String, Object> getResourceStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", resourceRepository.countByDeletedFalse());
        stats.put("active", resourceRepository.countByStatusAndDeletedFalse(ResourceStatus.ACTIVE));
        stats.put("outOfService", resourceRepository.countByStatusAndDeletedFalse(ResourceStatus.OUT_OF_SERVICE));
        stats.put("underMaintenance", resourceRepository.countByStatusAndDeletedFalse(ResourceStatus.UNDER_MAINTENANCE));
        for (ResourceType type : ResourceType.values()) {
            stats.put(type.name().toLowerCase() + "Count",
                    resourceRepository.countByTypeAndDeletedFalse(type));
        }
        return stats;
    }

    // ── Mapper ──────────────────────────────────────────────────────────────

    private ResourceResponse toResponse(Resource r) {
        return ResourceResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .availabilityWindow(r.getAvailabilityWindow())
                .status(r.getStatus())
                .description(r.getDescription())
                .imageUrl(r.getImageUrl())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .isAvailableNow(isAvailableNow(r))
                .build();
    }

    private boolean isAvailableNow(Resource r) {
        if (r.getStatus() != ResourceStatus.ACTIVE) return false;
        if (r.getAvailabilityWindow() == null) return true;
        try {
            String[] parts = r.getAvailabilityWindow().split("-");
            LocalTime start = LocalTime.parse(parts[0].trim(), DateTimeFormatter.ofPattern("HH:mm"));
            LocalTime end   = LocalTime.parse(parts[1].trim(), DateTimeFormatter.ofPattern("HH:mm"));
            LocalTime now   = LocalTime.now();
            return !now.isBefore(start) && !now.isAfter(end);
        } catch (Exception e) {
            return true;
        }
    }
}