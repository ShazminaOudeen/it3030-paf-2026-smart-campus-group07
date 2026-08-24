package com.assetra.incident.repository;

import com.assetra.incident.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;


public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByTicketId(UUID ticketId);
}