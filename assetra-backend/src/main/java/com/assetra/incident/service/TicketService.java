package com.assetra.incident.service;

import com.assetra.incident.dto.*;
import com.assetra.incident.entity.*;
import com.assetra.incident.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketImageRepository ticketImageRepository;
    private final CommentRepository commentRepository;

    private final String uploadDir = "uploads/tickets/";

    public TicketResponseDTO createTicket(TicketRequestDTO dto, UUID userId,
                                          List<MultipartFile> files) throws IOException {
        if (files != null && files.size() > 3) {
            throw new RuntimeException("Maximum 3 attachments allowed");
        }

        Ticket ticket = new Ticket();
        ticket.setUserId(userId);
        ticket.setResourceId(dto.getResourceId());
        ticket.setCategory(dto.getCategory());
        ticket.setDescription(dto.getDescription());
        ticket.setPriority(dto.getPriority());
        ticket.setContactDetails(dto.getContactDetails());
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);

        if (files != null) {
            for (MultipartFile file : files) {
                saveImage(file, saved);
            }
        }
        return mapToDTO(saved);
    }

    private void saveImage(MultipartFile file, Ticket ticket) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        TicketImage image = new TicketImage();
        image.setTicket(ticket);
        image.setFilePath(filePath.toString());
        image.setUploadedAt(LocalDateTime.now());
        ticketImageRepository.save(image);
    }

    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TicketResponseDTO> getMyTickets(UUID userId) {
        return ticketRepository.findByUserId(userId).stream()
                .map(this::mapToDTO).collect(Collectors.toList());
    }

    public TicketResponseDTO getTicketById(UUID id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return mapToDTO(ticket);
    }

    public TicketResponseDTO assignTechnician(UUID ticketId, UUID technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setAssignedTo(technicianId);
        ticket.setStatus("IN_PROGRESS");
        ticket.setAssignedAt(LocalDateTime.now()); // ← NEW
        return mapToDTO(ticketRepository.save(ticket));
    }

    public TicketResponseDTO updateStatus(UUID ticketId, String status,
                                          String notes, String reason) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus(status);
        if (notes != null) ticket.setResolutionNotes(notes);
        if (reason != null) ticket.setRejectionReason(reason);
        // ← NEW: set resolvedAt when status changes to RESOLVED
        if ("RESOLVED".equals(status) && ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        return mapToDTO(ticketRepository.save(ticket));
    }

    public CommentResponseDTO addComment(UUID ticketId, UUID userId, String content) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setUserId(userId);
        comment.setContent(content);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        return mapCommentToDTO(commentRepository.save(comment));
    }

    public CommentResponseDTO updateComment(UUID commentId, UUID userId, String content) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("You can only edit your own comments");
        }
        comment.setContent(content);
        comment.setUpdatedAt(LocalDateTime.now());
        return mapCommentToDTO(commentRepository.save(comment));
    }

    public void deleteComment(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    public List<CommentResponseDTO> getComments(UUID ticketId) {
        return commentRepository.findByTicketId(ticketId).stream()
                .map(this::mapCommentToDTO).collect(Collectors.toList());
    }

    private TicketResponseDTO mapToDTO(Ticket t) {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setId(t.getId());
        dto.setUserId(t.getUserId());
        dto.setResourceId(t.getResourceId());
        dto.setCategory(t.getCategory());
        dto.setDescription(t.getDescription());
        dto.setPriority(t.getPriority());
        dto.setContactDetails(t.getContactDetails());
        dto.setStatus(t.getStatus());
        dto.setRejectionReason(t.getRejectionReason());
        dto.setAssignedTo(t.getAssignedTo());
        dto.setResolutionNotes(t.getResolutionNotes());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setAssignedAt(t.getAssignedAt()); // ← NEW
        dto.setResolvedAt(t.getResolvedAt()); // ← NEW
        return dto;
    }

    private CommentResponseDTO mapCommentToDTO(Comment c) {
        CommentResponseDTO dto = new CommentResponseDTO();
        dto.setId(c.getId());
        dto.setTicketId(c.getTicket().getId());
        dto.setUserId(c.getUserId());
        dto.setContent(c.getContent());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }
}