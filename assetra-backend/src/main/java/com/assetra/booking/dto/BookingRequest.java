package com.assetra.booking.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Request body for creating a new booking (user-facing).
 */
public record BookingRequest(

    @NotNull(message = "Resource ID is required")
    UUID resourceId,

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date cannot be in the past")
    LocalDate bookingDate,

    @NotNull(message = "Start time is required")
    LocalTime startTime,

    @NotNull(message = "End time is required")
    LocalTime endTime,

    @NotBlank(message = "Purpose is required")
    @Size(max = 500)
    String purpose,

    @Min(value = 1, message = "Expected attendees must be at least 1")
    Integer expectedAttendees
) {}