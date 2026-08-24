package com.assetra.incident.repository;

import com.assetra.incident.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;


public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findByUserId(UUID userId);
    List<Ticket> findByAssignedTo(UUID assignedTo);
    List<Ticket> findByStatus(String status);
}