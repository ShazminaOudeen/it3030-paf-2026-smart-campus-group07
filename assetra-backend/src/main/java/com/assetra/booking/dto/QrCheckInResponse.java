package com.assetra.booking.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Lightweight response returned by the public QR check-in endpoint.
 * Does NOT expose sensitive user data.
 */
public record QrCheckInResponse(
    boolean valid,
    String bookingId,
    String resourceName,
    String resourceLocation,
    LocalDate bookingDate,
    LocalTime startTime,
    LocalTime endTime,
    String purpose,
    String userName,
    String message
) {}