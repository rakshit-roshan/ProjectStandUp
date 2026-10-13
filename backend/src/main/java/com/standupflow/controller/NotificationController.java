package com.standupflow.controller;

import com.standupflow.model.Notification;
import com.standupflow.repository.NotificationRepository;
import com.standupflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Notification> getAllNotifications(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestHeader(value = "X-User-Rootadmin", required = false) String headerRootAdmin,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) String userId,
            @RequestParam(value = "all", defaultValue = "false") boolean all) {

        // Resolve effective identity: prefer explicit query params over headers
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId.trim()
                : (headerUserId != null && !headerUserId.isBlank() ? headerUserId.trim() : null);
        String effectiveEmail = (userEmail != null && !userEmail.isBlank()) ? userEmail.trim().toLowerCase()
                : (headerUserEmail != null && !headerUserEmail.isBlank() ? headerUserEmail.trim().toLowerCase() : null);

        boolean isAdmin = (headerRootAdmin != null && ("1".equals(headerRootAdmin) || "true".equalsIgnoreCase(headerRootAdmin)))
                || (headerUserRole != null && ("1".equals(headerUserRole) || "ADMIN".equalsIgnoreCase(headerUserRole) || "ROOT".equalsIgnoreCase(headerUserRole)));

        // Admin explicitly requesting all notifications (e.g. admin dashboard)
        if (all && isAdmin) {
            return notificationRepository.findAll();
        }

        // ALWAYS filter by user identity when available — prevents cross-user notification leakage
        // This applies to both regular users AND admins fetching their own notifications
        if ((effectiveUserId != null && !effectiveUserId.isEmpty()) || (effectiveEmail != null && !effectiveEmail.isEmpty())) {
            return notificationRepository.findForUser(effectiveUserId, effectiveEmail);
        }

        // No identity provided at all — return empty to prevent data leakage
        return Collections.emptyList();
    }

    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) {
        if (notification.getId() == null || notification.getId().isBlank()) {
            notification.setId("NOTIF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (notification.getTimestamp() == null || notification.getTimestamp().isBlank()) {
            notification.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        }
        if (notification.getUserEmail() != null) {
            notification.setUserEmail(notification.getUserEmail().trim().toLowerCase());
        }

        // Resolve missing userId or userEmail to ensure proper isolation indexing
        if ((notification.getUserId() == null || notification.getUserId().isBlank()) && notification.getUserEmail() != null) {
            userRepository.findByEmail(notification.getUserEmail()).ifPresent(u -> notification.setUserId(u.getId()));
        } else if (notification.getUserId() != null && (notification.getUserEmail() == null || notification.getUserEmail().isBlank())) {
            userRepository.findById(notification.getUserId()).ifPresent(u -> notification.setUserEmail(u.getEmail()));
        }

        return notificationRepository.save(notification);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markRead(@PathVariable String id) {
        return notificationRepository.findById(id).map(notif -> {
            notif.setIsRead(true);
            return ResponseEntity.ok(notificationRepository.save(notif));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestBody(required = false) Map<String, String> body) {
        String email = body != null ? body.get("userEmail") : null;
        String userId = body != null ? body.get("userId") : null;

        if ((userId == null || userId.isBlank()) && headerUserId != null) {
            userId = headerUserId;
        }
        if ((email == null || email.isBlank()) && headerUserEmail != null) {
            email = headerUserEmail;
        }

        List<Notification> notifs;
        if ((userId != null && !userId.isBlank()) || (email != null && !email.isBlank())) {
            notifs = notificationRepository.findForUser(userId, email != null ? email.toLowerCase() : null);
        } else {
            notifs = Collections.emptyList();
        }

        for (Notification n : notifs) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(notifs);

        return ResponseEntity.ok().build();
    }
}
