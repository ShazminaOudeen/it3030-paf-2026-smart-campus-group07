package com.assetra.booking.service;

import com.assetra.booking.dto.*;

import java.util.List;
import java.util.UUID;

public interface BookingService {

    /** User creates a booking request */
    BookingResponse createBooking(UUID userId, BookingRequest request);

    /** User views their own bookings */
    List<BookingResponse> getMyBookings(UUID userId);

    /** User gets a single booking (ownership enforced in impl) */
    BookingResponse getBookingById(UUID bookingId, UUID requestingUserId, boolean isAdmin);

    /** Admin views all bookings, optionally filtered by status */
    List<BookingResponse> getAllBookings(String statusFilter);

    /** Admin views pending bookings only */
    List<BookingResponse> getPendingBookings();

    /** Admin approves or rejects a booking */
    BookingResponse reviewBooking(UUID bookingId, BookingReviewRequest request);

    /** User cancels their own approved/pending booking */
    BookingResponse cancelBooking(UUID bookingId, UUID userId);

    /** QR check-in — public endpoint, token is the lookup key */
    QrCheckInResponse verifyQrToken(String token);
}