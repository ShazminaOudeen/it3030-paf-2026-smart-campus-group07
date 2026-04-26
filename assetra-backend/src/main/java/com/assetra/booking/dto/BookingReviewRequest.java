package com.assetra.booking.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Admin approve / reject request body.
 */
public record BookingReviewRequest(

    @NotNull(message = "Action is required: APPROVED or REJECTED")
    String action,          // "APPROVED" or "REJECTED"

    String rejectionReason  // required only when action = REJECTED
) {}