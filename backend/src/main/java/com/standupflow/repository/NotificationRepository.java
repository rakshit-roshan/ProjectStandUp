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

    @org.springframework.data.jpa.repository.Query("SELECT n FROM Notification n WHERE " +
           "(:userId IS NOT NULL AND :userId != '' AND (n.userId = :userId OR n.userId LIKE CONCAT('%,', :userId) OR n.userId LIKE CONCAT(:userId, ',%') OR n.userId LIKE CONCAT('%,', :userId, ',%'))) OR " +
           "(:userEmail IS NOT NULL AND :userEmail != '' AND LOWER(n.userEmail) = LOWER(:userEmail)) " +
           "ORDER BY n.timestamp DESC")
    List<Notification> findForUser(@org.springframework.data.repository.query.Param("userId") String userId, 
                                   @org.springframework.data.repository.query.Param("userEmail") String userEmail);
}
