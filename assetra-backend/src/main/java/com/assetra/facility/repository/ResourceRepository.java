package com.assetra.facility.repository;

import com.assetra.facility.entity.Resource;
import com.assetra.facility.enums.ResourceStatus;
import com.assetra.facility.enums.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID>,
        JpaSpecificationExecutor<Resource> {

    Optional<Resource> findByIdAndDeletedFalse(UUID id);

    long countByDeletedFalse();
    long countByStatusAndDeletedFalse(ResourceStatus status);
    long countByTypeAndDeletedFalse(ResourceType type);
}