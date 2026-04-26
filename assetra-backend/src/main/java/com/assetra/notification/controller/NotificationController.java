package com.assetra.notification.controller;

import com.assetra.notification.dto.NotificationResponse;
import com.assetra.notification.service.NotificationService;
import com.assetra.notification.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtService jwtService;

    // ── Helper: extract user UUID from JWT ──
    private UUID currentUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new com.assetra.shared.exception.UnauthorizedException(
                    "Missing or invalid Authorization header");
        }
        return UUID.fromString(jwtService.extractId(authHeader.substring(7)));
    }

    // GET /api/notifications — get all notifications for logged-in user
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            HttpServletRequest request) {
        UUID userId = currentUserId(request);
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    // GET /api/notifications/unread-count — get unread count (for badge)
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(HttpServletRequest request) {
        UUID userId = currentUserId(request);
        long count = notificationService.countUnread(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // PUT /api/notifications/{id}/read — mark one as read
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = currentUserId(request);
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    // PUT /api/notifications/read-all — mark all as read
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(HttpServletRequest request) {
        UUID userId = currentUserId(request);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    // DELETE /api/notifications/{id} — delete a notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = currentUserId(request);
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }
}