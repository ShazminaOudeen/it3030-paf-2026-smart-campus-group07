package com.assetra.notification.repository;

import com.assetra.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    // Get all notifications for a user, newest first
    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);

    // Count unread notifications for a user
    long countByUserIdAndReadFalse(UUID userId);

    // Mark all as read for a user
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId AND n.read = false")
    void markAllReadByUserId(UUID userId);
}