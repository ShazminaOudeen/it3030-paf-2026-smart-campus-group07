package com.assetra.incident.repository;

import com.assetra.incident.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findByUserId(UUID userId);
    List<Ticket> findByAssignedTo(UUID assignedTo);
    List<Ticket> findByStatus(String status);
}