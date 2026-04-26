package com.assetra.facility.service;

import com.assetra.facility.dto.ResourceRequest;
import com.assetra.facility.dto.ResourceResponse;
import com.assetra.facility.enums.ResourceStatus;
import com.assetra.facility.enums.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;
import java.util.UUID;

public interface ResourceService {

    // GET /api/resources - list with filters and pagination
    Page<ResourceResponse> getAllResources(
            ResourceType type,
            ResourceStatus status,
            Integer minCapacity,
            String location,
            String search,
            Pageable pageable
    );

    // GET /api/resources/{id}
    ResourceResponse getResourceById(UUID id);

    // POST /api/resources (ADMIN only)
    ResourceResponse createResource(ResourceRequest request);

    // PUT /api/resources/{id} (ADMIN only)
    ResourceResponse updateResource(UUID id, ResourceRequest request);

    // PATCH /api/resources/{id}/status (ADMIN only)
    ResourceResponse updateResourceStatus(UUID id, ResourceStatus status);

    // DELETE /api/resources/{id} (ADMIN only) - soft delete
    void deleteResource(UUID id);

    // GET /api/resources/stats (ADMIN only)
    Map<String, Object> getResourceStats();
}
