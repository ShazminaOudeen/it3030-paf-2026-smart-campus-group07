package com.assetra.incident.controller;

import com.assetra.incident.dto.*;
import com.assetra.incident.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    // POST /api/tickets — create ticket with optional images
    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(
            @RequestPart("ticket") TicketRequestDTO dto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @RequestHeader("X-User-Id") UUID userId) throws IOException {
        return ResponseEntity.status(201).body(ticketService.createTicket(dto, userId, files));
    }

    // GET /api/tickets — admin get all
    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // GET /api/tickets/my — user get own tickets
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(ticketService.getMyTickets(userId));
    }

    // GET /api/tickets/{id}
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // PUT /api/tickets/{id}/assign — admin assign technician
    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTechnician(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                ticketService.assignTechnician(id, UUID.fromString(body.get("technicianId"))));
    }

    // PATCH /api/tickets/{id}/status — update ticket status
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ticketService.updateStatus(
                id,
                body.get("status"),
                body.get("resolutionNotes"),
                body.get("rejectionReason")));
    }

    // POST /api/tickets/{id}/comments — add comment
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable UUID id,
            @RequestBody CommentRequestDTO dto,
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.status(201)
                .body(ticketService.addComment(id, userId, dto.getContent()));
    }

    // GET /api/tickets/{id}/comments — get comments
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    // PUT /api/tickets/comments/{commentId} — edit comment
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable UUID commentId,
            @RequestBody CommentRequestDTO dto,
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(ticketService.updateComment(commentId, userId, dto.getContent()));
    }

    // DELETE /api/tickets/comments/{commentId} — delete comment
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            @RequestHeader("X-User-Id") UUID userId) {
        ticketService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}