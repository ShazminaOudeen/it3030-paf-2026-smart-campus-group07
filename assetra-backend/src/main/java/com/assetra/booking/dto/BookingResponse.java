package com.assetra.booking.dto;

import com.assetra.booking.enums.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Response payload returned to the client for booking data.
 */
public record BookingResponse(
    UUID id,
    UUID userId,
    String userName,
    String userEmail,
    UUID resourceId,
    String resourceName,
    String resourceLocation,
    LocalDate bookingDate,
    LocalTime startTime,
    LocalTime endTime,
    String purpose,
    Integer expectedAttendees,
    BookingStatus status,
    String rejectionReason,
    String qrToken,          // only populated when status = APPROVED
    LocalDateTime createdAt
) {}