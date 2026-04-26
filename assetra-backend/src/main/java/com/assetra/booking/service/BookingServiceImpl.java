package com.assetra.booking.service;

import com.assetra.booking.dto.*;
import com.assetra.booking.entity.Booking;
import com.assetra.booking.enums.BookingStatus;
import com.assetra.booking.repository.BookingRepository;
import com.assetra.facility.entity.Resource;
import com.assetra.facility.repository.ResourceRepository;
import com.assetra.notification.service.NotificationService;
import com.assetra.shared.entity.User;
import com.assetra.shared.enums.NotificationType;
import com.assetra.shared.exception.ConflictException;
import com.assetra.shared.exception.ResourceNotFoundException;
import com.assetra.shared.exception.UnauthorizedException;
import com.assetra.shared.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BookingResponse createBooking(UUID userId, BookingRequest req) {

        // Validate time range
        if (!req.endTime().isAfter(req.startTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Resource resource = resourceRepository.findById(req.resourceId())
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        // Conflict detection
        List<Booking> conflicts = bookingRepository.findConflicts(
            resource.getId(), req.bookingDate(), req.startTime(), req.endTime()
        );
        if (!conflicts.isEmpty()) {
            throw new ConflictException(
                "This resource already has a booking that overlaps with the requested time slot"
            );
        }

        Booking booking = Booking.builder()
            .user(user)
            .resource(resource)
            .bookingDate(req.bookingDate())
            .startTime(req.startTime())
            .endTime(req.endTime())
            .purpose(req.purpose())
            .expectedAttendees(req.expectedAttendees())
            .status(BookingStatus.PENDING)
            .build();

        return toResponse(bookingRepository.save(booking));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public List<BookingResponse> getMyBookings(UUID userId) {
        return bookingRepository.findByUserId(userId)
            .stream().map(this::toResponse).toList();
    }

    @Override
    public BookingResponse getBookingById(UUID bookingId, UUID requestingUserId, boolean isAdmin) {
        Booking booking = findOrThrow(bookingId);
        if (!isAdmin && !booking.getUser().getId().equals(requestingUserId)) {
            throw new UnauthorizedException("You are not authorised to view this booking");
        }
        return toResponse(booking);
    }

    @Override
    public List<BookingResponse> getAllBookings(String statusFilter) {
        if (statusFilter == null || statusFilter.isBlank()) {
            return bookingRepository.findAll().stream().map(this::toResponse).toList();
        }
        BookingStatus status = BookingStatus.valueOf(statusFilter.toUpperCase());
        return bookingRepository.findByStatus(status).stream().map(this::toResponse).toList();
    }

    @Override
    public List<BookingResponse> getPendingBookings() {
        return bookingRepository.findByStatus(BookingStatus.PENDING)
            .stream().map(this::toResponse).toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN REVIEW
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BookingResponse reviewBooking(UUID bookingId, BookingReviewRequest req) {
        Booking booking = findOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Only PENDING bookings can be reviewed");
        }

        String action = req.action().toUpperCase();

        switch (action) {
            case "APPROVED" -> {
                booking.setStatus(BookingStatus.APPROVED);
                // Generate QR token on approval
                booking.setQrToken(UUID.randomUUID().toString());

                // Fire notification
                notificationService.createNotification(
                    booking.getUser().getId(),
                    NotificationType.BOOKING_APPROVED,
                    "Your booking for " + booking.getResource().getName()
                        + " on " + booking.getBookingDate() + " has been approved.",
                    booking.getId(),
                    "BOOKING"
                );
            }
            case "REJECTED" -> {
                if (req.rejectionReason() == null || req.rejectionReason().isBlank()) {
                    throw new IllegalArgumentException("Rejection reason is required");
                }
                booking.setStatus(BookingStatus.REJECTED);
                booking.setRejectionReason(req.rejectionReason());

                notificationService.createNotification(
                    booking.getUser().getId(),
                    NotificationType.BOOKING_REJECTED,
                    "Your booking for " + booking.getResource().getName()
                        + " on " + booking.getBookingDate() + " was rejected. Reason: "
                        + req.rejectionReason(),
                    booking.getId(),
                    "BOOKING"
                );
            }
            default -> throw new IllegalArgumentException("Invalid action. Use APPROVED or REJECTED");
        }

        return toResponse(bookingRepository.save(booking));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER CANCEL
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BookingResponse cancelBooking(UUID bookingId, UUID userId) {
        Booking booking = findOrThrow(bookingId);

        if (!booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorised to cancel this booking");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED
                || booking.getStatus() == BookingStatus.REJECTED) {
            throw new ConflictException("Booking is already " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return toResponse(bookingRepository.save(booking));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // QR CHECK-IN
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public QrCheckInResponse verifyQrToken(String token) {
        return bookingRepository.findByQrToken(token)
            .map(b -> {
                boolean valid = b.getStatus() == BookingStatus.APPROVED;
                return new QrCheckInResponse(
                    valid,
                    b.getId().toString(),
                    b.getResource().getName(),
                    b.getResource().getLocation(),
                    b.getBookingDate(),
                    b.getStartTime(),
                    b.getEndTime(),
                    b.getPurpose(),
                    b.getUser().getName(),
                    valid ? "Check-in successful" : "Booking is not in APPROVED status"
                );
            })
            .orElse(new QrCheckInResponse(
                false, null, null, null, null, null, null, null, null,
                "Invalid or expired QR code"
            ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private Booking findOrThrow(UUID id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    private BookingResponse toResponse(Booking b) {
        return new BookingResponse(
            b.getId(),
            b.getUser().getId(),
            b.getUser().getName(),
            b.getUser().getEmail(),
            b.getResource().getId(),
            b.getResource().getName(),
            b.getResource().getLocation(),
            b.getBookingDate(),
            b.getStartTime(),
            b.getEndTime(),
            b.getPurpose(),
            b.getExpectedAttendees(),
            b.getStatus(),
            b.getRejectionReason(),
            b.getQrToken(),
            b.getCreatedAt()
        );
    }
}