package com.standupflow.controller;

import com.standupflow.model.Notification;
import com.standupflow.model.TaskItem;
import com.standupflow.model.User;
import com.standupflow.repository.NotificationRepository;
import com.standupflow.repository.TaskRepository;
import com.standupflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<TaskItem> getAllTasks() {
        return taskRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskItem> getTaskById(@PathVariable String id) {
        return taskRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public TaskItem createTask(@RequestBody TaskItem task) {
        TaskItem saved = taskRepository.save(task);
        createNotificationsForTask(saved, "New Task Assigned");
        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskItem> updateTask(@PathVariable String id, @RequestBody TaskItem taskDetails) {
        return taskRepository.findById(id).map(task -> {
            String oldAssignee = task.getAssigneeId();

            task.setTitle(taskDetails.getTitle());
            task.setDescription(taskDetails.getDescription());
            task.setStatus(taskDetails.getStatus());
            task.setPriority(taskDetails.getPriority());
            task.setAssigneeId(taskDetails.getAssigneeId());
            task.setAssigneeName(taskDetails.getAssigneeName());
            if (taskDetails.getReporterId() != null) task.setReporterId(taskDetails.getReporterId());
            if (taskDetails.getReporterName() != null) task.setReporterName(taskDetails.getReporterName());
            if (taskDetails.getAssigneeAvatar() != null) task.setAssigneeAvatar(taskDetails.getAssigneeAvatar());
            if (taskDetails.getSprintId() != null) task.setSprintId(taskDetails.getSprintId());
            if (taskDetails.getSprintName() != null) task.setSprintName(taskDetails.getSprintName());
            task.setStoryPoints(taskDetails.getStoryPoints());
            task.setTestingStatus(taskDetails.getTestingStatus());
            task.setDueDate(taskDetails.getDueDate());
            task.setUpdatedAt(taskDetails.getUpdatedAt());

            TaskItem updated = taskRepository.save(task);

            // Trigger notification if assignee changed or assigned
            if (taskDetails.getAssigneeId() != null && !taskDetails.getAssigneeId().equalsIgnoreCase(oldAssignee)) {
                createNotificationsForTask(updated, "Task Assigned To You");
            }

            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    private void createNotificationsForTask(TaskItem task, String notifTitle) {
        if (task.getAssigneeId() == null || task.getAssigneeId().isBlank()) return;

        String[] assigneeIds = task.getAssigneeId().split(",");
        String senderName = task.getReporterName() != null && !task.getReporterName().isBlank() ? task.getReporterName() : "Manager";

        for (String aId : assigneeIds) {
            String cleanId = aId.trim();
            if (cleanId.isEmpty()) continue;

            Optional<User> userOpt = userRepository.findById(cleanId);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByEmail(cleanId);
            }

            String userId = cleanId;
            String userEmail = cleanId;
            if (userOpt.isPresent()) {
                userId = userOpt.get().getId();
                userEmail = userOpt.get().getEmail();
            }

            String targetName = userOpt.isPresent() ? userOpt.get().getName() : (task.getAssigneeName() != null && !task.getAssigneeName().isBlank() ? task.getAssigneeName() : "you");

            Notification notif = new Notification(
                    "NOTIF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                    userId,
                    userEmail,
                    notifTitle,
                    senderName + " assigned task \"" + task.getTitle() + "\" (" + task.getId() + ") to " + targetName + ".",
                    senderName,
                    task.getId(),
                    false,
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
            );
            notificationRepository.save(notif);
        }
    }
}
