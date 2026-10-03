package com.standupflow.repository;

import com.standupflow.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserId(String userId);
    List<Notification> findByUserEmailIgnoreCase(String userEmail);
    List<Notification> findByUserIdOrUserEmailIgnoreCase(String userId, String userEmail);
}
