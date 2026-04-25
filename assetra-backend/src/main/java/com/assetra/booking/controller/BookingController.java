package com.assetra.booking.controller;

import com.assetra.booking.dto.*;
import com.assetra.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Member 2 — Booking Management endpoints.
 *
 * NOTE: @PreAuthorize removed temporarily until Member 4 completes OAuth.
 * A hardcoded test user ID is used for user-scoped endpoints.
 * Restore auth before final submission.
 *
 * POST   /api/bookings                    → create booking
 * GET    /api/bookings/my                 → my bookings
 * GET    /api/bookings/{id}               → single booking
 * GET    /api/bookings                    → all bookings (admin, ?status=)
 * GET    /api/bookings/pending            → pending only (admin)
 * PUT    /api/bookings/{id}/review        → approve/reject (admin)
 * PATCH  /api/bookings/{id}/cancel        → cancel
 * GET    /api/bookings/checkin/{token}    → QR verify (public)
 */
@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // Hardcoded test user — matches the inserted test data
    // Replace with principal lookup once OAuth is ready
    private static final UUID TEST_USER_ID =
        UUID.fromString("a0000000-0000-0000-0000-000000000002");

    // ── CREATE ────────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(bookingService.createBooking(TEST_USER_ID, request));
    }

    // ── MY BOOKINGS ───────────────────────────────────────────────────────────

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings(TEST_USER_ID));
    }

    // ── SINGLE BOOKING ────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.getBookingById(id, TEST_USER_ID, true));
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
            @Valid @RequestBody BookingReviewRequest request) {
        return ResponseEntity.ok(bookingService.reviewBooking(id, request));
    }

    // ── CANCEL ────────────────────────────────────────────────────────────────

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, TEST_USER_ID));
    }

    // ── QR CHECK-IN (public) ──────────────────────────────────────────────────

    @GetMapping("/checkin/{token}")
    public ResponseEntity<QrCheckInResponse> verifyQrToken(@PathVariable String token) {
        return ResponseEntity.ok(bookingService.verifyQrToken(token));
    }
}