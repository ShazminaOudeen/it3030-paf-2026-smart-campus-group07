package com.assetra.booking.repository;

import com.assetra.booking.entity.Booking;
import com.assetra.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByUserId(UUID userId);

    List<Booking> findByResourceId(UUID resourceId);

    List<Booking> findByStatus(BookingStatus status);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.resource.id = :resourceId
          AND b.bookingDate = :date
          AND b.status NOT IN ('REJECTED', 'CANCELLED')
          AND b.startTime < :endTime
          AND b.endTime > :startTime
    """)
    List<Booking> findConflicts(
        @Param("resourceId") UUID resourceId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );

    @Query("""
        SELECT b FROM Booking b
        WHERE b.resource.id = :resourceId
          AND b.bookingDate = :date
          AND b.status NOT IN ('REJECTED', 'CANCELLED')
          AND b.startTime < :endTime
          AND b.endTime > :startTime
          AND b.id <> :excludeId
    """)
    List<Booking> findConflictsExcluding(
        @Param("resourceId") UUID resourceId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("excludeId") UUID excludeId
    );

    Optional<Booking> findByQrToken(String qrToken);
}