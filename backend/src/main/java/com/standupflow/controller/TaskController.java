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

    @Autowired
    private com.standupflow.repository.ProjectRepository projectRepository;

    @GetMapping
    public List<TaskItem> getAllTasks(
            @RequestParam(required = false) String projectId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Rootadmin", required = false) String rootAdminStr
    ) {
        List<TaskItem> all = (projectId != null && !projectId.isBlank())
                ? taskRepository.findByProjectId(projectId.trim())
                : taskRepository.findAll();

        boolean isRootAdmin = "1".equals(rootAdminStr) || "true".equalsIgnoreCase(rootAdminStr);
        boolean isManagerOrAdmin = isRootAdmin ||
                "1".equalsIgnoreCase(userRole) || "2".equalsIgnoreCase(userRole) ||
                "ADMIN".equalsIgnoreCase(userRole) || "MANAGER".equalsIgnoreCase(userRole);
        if (isManagerOrAdmin) {
            return all;
        }

        String finalUserId = userId != null ? userId.trim() : "";
        String finalEmail = userEmail != null ? userEmail.trim().toLowerCase() : "";
        String finalName = userName != null ? userName.trim().toLowerCase() : "";

        // Non-admin without any identification should not see tasks
        if (finalUserId.isEmpty() && finalEmail.isEmpty() && finalName.isEmpty()) {
            return Collections.emptyList();
        }

        return all.stream().filter(task -> isTaskAssignedToUser(task, finalUserId, finalEmail, finalName))
                .collect(java.util.stream.Collectors.toList());
    }

    private boolean isTaskAssignedToUser(TaskItem task, String userId, String email, String name) {
        if (task == null) return false;

        // Check assigneeId (comma-separated or single)
        if (task.getAssigneeId() != null && !task.getAssigneeId().isBlank()) {
            String[] parts = task.getAssigneeId().split(",");
            for (String p : parts) {
                String trimmed = p.trim();
                if (!trimmed.isEmpty()) {
                    if (!userId.isEmpty() && trimmed.equalsIgnoreCase(userId)) return true;
                    if (!email.isEmpty() && trimmed.equalsIgnoreCase(email)) return true;
                }
            }
        }


        // Check assigneeName (strict match; NEVER match "unassigned" or blank)
        if (task.getAssigneeName() != null && !task.getAssigneeName().isBlank() && !name.isEmpty()) {
            String[] parts = task.getAssigneeName().split(",");
            for (String p : parts) {
                String trimmed = p.trim().toLowerCase();
                if (!trimmed.isEmpty() && !trimmed.equalsIgnoreCase("unassigned") && trimmed.equalsIgnoreCase(name)) {
                    return true;
                }
            }
        }

        // Check testerId / testerName
        if (!userId.isEmpty() && task.getTesterId() != null && userId.equalsIgnoreCase(task.getTesterId().trim())) return true;
        if (!name.isEmpty() && task.getTesterName() != null && !task.getTesterName().isBlank()) {
            String tName = task.getTesterName().trim().toLowerCase();
            if (!tName.isEmpty() && !tName.equalsIgnoreCase("unassigned") && tName.equalsIgnoreCase(name)) {
                return true;
            }
        }

        return false;
    }

    private void linkAssigneeToProject(TaskItem task) {
        if (task.getProjectId() == null || task.getProjectId().isBlank() || task.getAssigneeId() == null || task.getAssigneeId().isBlank()) {
            return;
        }
        projectRepository.findById(task.getProjectId()).ifPresent(proj -> {
            boolean changed = false;
            String memberIds = proj.getMemberIds() != null ? proj.getMemberIds() : "";
            Set<String> idSet = new HashSet<>(Arrays.asList(memberIds.split(",")));
            idSet.remove("");

            String[] assignees = task.getAssigneeId().split(",");
            for (String aId : assignees) {
                String clean = aId.trim();
                if (!clean.isEmpty() && !idSet.contains(clean)) {
                    idSet.add(clean);
                    changed = true;
                }
            }

            if (changed) {
                proj.setMemberIds(String.join(",", idSet));
                projectRepository.save(proj);
            }
        });
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskItem> getTaskById(@PathVariable String id) {
        return taskRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public TaskItem createTask(@RequestBody TaskItem task) {
        if (task.getId() == null || task.getId().isBlank()) {
            task.setId("TASK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (task.getAssigneeId() == null || task.getAssigneeId().isBlank()) {
            task.setAssigneeId("");
            task.setAssigneeName("Unassigned");
            task.setAssigneeAvatar("");
        }
        if (task.getStatus() == null || task.getStatus().isBlank()) {
            task.setStatus("Backlog");
        }
        if (task.getTestingStatus() == null || task.getTestingStatus().isBlank()) {
            task.setTestingStatus("Pending Testing");
        }
        if (task.getHasIssue() == null) {
            task.setHasIssue(false);
        }
        if (task.getStoryPoints() == null) {
            task.setStoryPoints(3);
        }
        if (task.getUpdatedAt() == null) {
            task.setUpdatedAt(LocalDateTime.now().toString());
        }
        TaskItem saved = taskRepository.save(task);
        linkAssigneeToProject(saved);
        // Only create notifications when there is an explicit assignee
        if (saved.getAssigneeId() != null && !saved.getAssigneeId().isBlank()) {
            createNotificationsForTask(saved, "New Task Assigned");
        }
        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskItem> updateTask(
            @PathVariable String id,
            @RequestBody TaskItem taskDetails,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Rootadmin", required = false) String rootAdminStr
    ) {
        return taskRepository.findById(id).map(task -> {
            boolean isRootAdmin = "1".equals(rootAdminStr) || "true".equalsIgnoreCase(rootAdminStr);
            boolean isManagerOrAdmin = isRootAdmin || userRole == null ||
                    "1".equalsIgnoreCase(userRole) || "2".equalsIgnoreCase(userRole) ||
                    "ADMIN".equalsIgnoreCase(userRole) || "MANAGER".equalsIgnoreCase(userRole);

            String oldAssignee = task.getAssigneeId() != null ? task.getAssigneeId() : "";

            // Scope & Assignee fields can only be modified by privileged Manager/Admin roles
            if (isManagerOrAdmin) {
                if (taskDetails.getTitle() != null) task.setTitle(taskDetails.getTitle());
                if (taskDetails.getDescription() != null) task.setDescription(taskDetails.getDescription());
                if (taskDetails.getPriority() != null) task.setPriority(taskDetails.getPriority());
                if (taskDetails.getStoryPoints() != null) task.setStoryPoints(taskDetails.getStoryPoints());
                if (taskDetails.getSprintId() != null) task.setSprintId(taskDetails.getSprintId());
                if (taskDetails.getSprintName() != null) task.setSprintName(taskDetails.getSprintName());
                if (taskDetails.getDueDate() != null) task.setDueDate(taskDetails.getDueDate());
                if (taskDetails.getStartDate() != null) task.setStartDate(taskDetails.getStartDate());
                if (taskDetails.getAssigneeId() != null) {
                    task.setAssigneeId(taskDetails.getAssigneeId());
                    if (taskDetails.getAssigneeId().isBlank()) {
                        task.setAssigneeName("Unassigned");
                        task.setAssigneeAvatar("");
                    }
                }
                if (taskDetails.getAssigneeName() != null && (taskDetails.getAssigneeId() == null || !taskDetails.getAssigneeId().isBlank())) {
                    task.setAssigneeName(taskDetails.getAssigneeName());
                }
                if (taskDetails.getAssigneeAvatar() != null && (taskDetails.getAssigneeId() == null || !taskDetails.getAssigneeId().isBlank())) {
                    task.setAssigneeAvatar(taskDetails.getAssigneeAvatar());
                }
                if (taskDetails.getReporterId() != null) task.setReporterId(taskDetails.getReporterId());
                if (taskDetails.getReporterName() != null) task.setReporterName(taskDetails.getReporterName());
                if (taskDetails.getProjectId() != null) task.setProjectId(taskDetails.getProjectId());
                if (taskDetails.getProjectName() != null) task.setProjectName(taskDetails.getProjectName());
            }

            // Task execution fields (Status, QA testing) are updatable by contributors
            if (taskDetails.getStatus() != null) task.setStatus(taskDetails.getStatus());
            if (taskDetails.getTestingStatus() != null) task.setTestingStatus(taskDetails.getTestingStatus());
            if (taskDetails.getTesterId() != null) task.setTesterId(taskDetails.getTesterId());
            if (taskDetails.getTesterName() != null) task.setTesterName(taskDetails.getTesterName());
            if (taskDetails.getHasIssue() != null) task.setHasIssue(taskDetails.getHasIssue());
            if (taskDetails.getUpdatedAt() != null) task.setUpdatedAt(taskDetails.getUpdatedAt());
            else task.setUpdatedAt(LocalDateTime.now().toString());

            TaskItem updated = taskRepository.save(task);
            linkAssigneeToProject(updated);

            // Trigger notification if assignee changed or assigned
            if (isManagerOrAdmin && taskDetails.getAssigneeId() != null && !taskDetails.getAssigneeId().isBlank() && !taskDetails.getAssigneeId().equalsIgnoreCase(oldAssignee)) {
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
        String rawAssignees = task.getAssigneeId();
        // Only proceed if a real assignee ID is set — never use assigneeName as a fallback
        if (rawAssignees == null || rawAssignees.isBlank() || "unassigned".equalsIgnoreCase(rawAssignees.trim())) return;

        String[] assigneeIds = rawAssignees.split(",");
        String senderName = task.getReporterName() != null && !task.getReporterName().isBlank() ? task.getReporterName() : "Manager";

        for (String aId : assigneeIds) {
            String cleanId = aId.trim();
            if (cleanId.isEmpty()) continue;

            Optional<User> userOpt = userRepository.findById(cleanId);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByEmail(cleanId);
            }
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByUsername(cleanId);
            }
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByUsernameOrEmailidOrFullname(cleanId, cleanId, cleanId);
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
