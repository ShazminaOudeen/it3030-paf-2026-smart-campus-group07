package com.assetra.incident.repository;

import com.assetra.incident.entity.TicketImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;


public interface TicketImageRepository extends JpaRepository<TicketImage, UUID> {
    List<TicketImage> findByTicketId(UUID ticketId);
    long countByTicketId(UUID ticketId);
}