package com.assetra.incident.repository;

import com.assetra.incident.entity.TicketImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TicketImageRepository extends JpaRepository<TicketImage, UUID> {
    List<TicketImage> findByTicketId(UUID ticketId);
    long countByTicketId(UUID ticketId);
}