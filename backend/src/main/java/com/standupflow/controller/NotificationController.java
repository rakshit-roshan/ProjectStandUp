package com.standupflow.controller;

import com.standupflow.model.Notification;
import com.standupflow.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> getAllNotifications(@RequestParam(required = false) String userEmail,
                                                  @RequestParam(required = false) String userId) {
        if (userId != null && !userId.isBlank()) {
            return notificationRepository.findByUserId(userId);
        }
        if (userEmail != null && !userEmail.isBlank()) {
            return notificationRepository.findByUserEmailIgnoreCase(userEmail.trim().toLowerCase());
        }
        return notificationRepository.findAll();
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
    public ResponseEntity<Void> markAllRead(@RequestBody Map<String, String> body) {
        String email = body.get("userEmail");
        String userId = body.get("userId");

        List<Notification> notifs;
        if (userId != null && !userId.isBlank()) {
            notifs = notificationRepository.findByUserId(userId);
        } else if (email != null && !email.isBlank()) {
            notifs = notificationRepository.findByUserEmailIgnoreCase(email.trim().toLowerCase());
        } else {
            notifs = notificationRepository.findAll();
        }

        for (Notification n : notifs) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(notifs);

        return ResponseEntity.ok().build();
    }
}
