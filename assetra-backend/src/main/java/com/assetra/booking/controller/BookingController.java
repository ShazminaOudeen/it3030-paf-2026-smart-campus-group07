package com.assetra.booking.controller;

import com.assetra.booking.dto.*;
import com.assetra.booking.service.BookingService;
import com.assetra.notification.security.JwtService;
import com.assetra.shared.exception.UnauthorizedException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final JwtService jwtService;

    // ── Helper: extract user ID from JWT in request header ───────────────────
    private UUID currentUserId(HttpServletRequest request) {
    String authHeader = request.getHeader("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedException("Missing or invalid Authorization header");
    }
    String token = authHeader.substring(7);
    return UUID.fromString(jwtService.extractId(token));
}

    // ── CREATE ────────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            HttpServletRequest request,
            @Valid @RequestBody BookingRequest body) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(bookingService.createBooking(currentUserId(request), body));
    }

    // ── MY BOOKINGS ───────────────────────────────────────────────────────────

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            HttpServletRequest request) {
        return ResponseEntity.ok(bookingService.getMyBookings(currentUserId(request)));
    }

    // ── SINGLE BOOKING ────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBooking(
            HttpServletRequest request,
            @PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.getBookingById(id, currentUserId(request), false));
    }

    // ── ALL BOOKINGS (admin) ──────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(bookingService.getAllBookings(status));
    }

    // ── PENDING ONLY (admin) ──────────────────────────────────────────────────

    @GetMapping("/pending")
    public ResponseEntity<List<BookingResponse>> getPendingBookings() {
        return ResponseEntity.ok(bookingService.getPendingBookings());
    }

    // ── REVIEW (admin) ────────────────────────────────────────────────────────

    @PutMapping("/{id}/review")
    public ResponseEntity<BookingResponse> reviewBooking(
            @PathVariable UUID id,
            @Valid @RequestBody BookingReviewRequest body) {
        return ResponseEntity.ok(bookingService.reviewBooking(id, body));
    }

    // ── CANCEL ────────────────────────────────────────────────────────────────

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            HttpServletRequest request,
            @PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, currentUserId(request)));
    }

    // ── QR CHECK-IN (public) ──────────────────────────────────────────────────

    @GetMapping("/checkin/{token}")
    public ResponseEntity<QrCheckInResponse> verifyQrToken(@PathVariable String token) {
        return ResponseEntity.ok(bookingService.verifyQrToken(token));
    }
}