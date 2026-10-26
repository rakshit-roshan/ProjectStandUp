package com.standupflow.controller;

import com.standupflow.model.IssueItem;
import com.standupflow.model.Notification;
import com.standupflow.model.User;
import com.standupflow.repository.IssueRepository;
import com.standupflow.repository.NotificationRepository;
import com.standupflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/issues")
public class IssueController {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<IssueItem> getAllIssues(
            @RequestParam(required = false) String projectId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Rootadmin", required = false) String rootAdminStr
    ) {
        List<IssueItem> list = (projectId != null && !projectId.isBlank())
                ? issueRepository.findByProjectId(projectId.trim())
                : issueRepository.findAll();

        boolean isAdmin = userId == null || "1".equals(rootAdminStr) || "true".equalsIgnoreCase(rootAdminStr) ||
                "1".equalsIgnoreCase(userRole) || "2".equalsIgnoreCase(userRole) ||
                "ADMIN".equalsIgnoreCase(userRole) || "ROOT".equalsIgnoreCase(userRole) || "MANAGER".equalsIgnoreCase(userRole);
        if (isAdmin) {
            return list;
        }

        String finalUserId = userId != null ? userId.trim() : "";
        String finalName = userName != null ? userName.trim().toLowerCase() : "";

        return list.stream().filter(issue -> {
            if (!finalUserId.isEmpty() && finalUserId.equalsIgnoreCase(issue.getAssigneeId())) return true;
            if (!finalUserId.isEmpty() && finalUserId.equalsIgnoreCase(issue.getReporterId())) return true;
            if (!finalName.isEmpty() && issue.getAssigneeName() != null && issue.getAssigneeName().toLowerCase().contains(finalName)) return true;
            if (!finalName.isEmpty() && issue.getReporterName() != null && issue.getReporterName().toLowerCase().contains(finalName)) return true;
            return false;
        }).collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueItem> getIssueById(@PathVariable String id) {
        return issueRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public IssueItem createIssue(@RequestBody IssueItem issue) {
        if (issue.getId() == null || issue.getId().isBlank()) {
            issue.setId("BUG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (issue.getState() == null || issue.getState().isBlank()) {
            issue.setState("Pending");
        }
        if (issue.getPriority() == null || issue.getPriority().isBlank()) {
            issue.setPriority("High");
        }
        if (issue.getSeverity() == null || issue.getSeverity().isBlank()) {
            issue.setSeverity("High");
        }
        IssueItem saved = issueRepository.save(issue);
        // Notify assigned user when a real assignee is set
        if (saved.getAssigneeId() != null && !saved.getAssigneeId().isBlank()) {
            createNotificationForIssue(saved, "Bug Assigned To You");
        }
        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueItem> updateIssue(@PathVariable String id, @RequestBody IssueItem issueDetails) {
        return issueRepository.findById(id).map(issue -> {
            String oldAssignee = issue.getAssigneeId() != null ? issue.getAssigneeId() : "";
            if (issueDetails.getTitle() != null) issue.setTitle(issueDetails.getTitle());
            if (issueDetails.getDescription() != null) issue.setDescription(issueDetails.getDescription());
            if (issueDetails.getState() != null) issue.setState(issueDetails.getState());
            if (issueDetails.getPriority() != null) issue.setPriority(issueDetails.getPriority());
            if (issueDetails.getSeverity() != null) issue.setSeverity(issueDetails.getSeverity());
            if (issueDetails.getAssigneeId() != null) issue.setAssigneeId(issueDetails.getAssigneeId());
            if (issueDetails.getAssigneeName() != null) issue.setAssigneeName(issueDetails.getAssigneeName());
            if (issueDetails.getAssigneeAvatar() != null) issue.setAssigneeAvatar(issueDetails.getAssigneeAvatar());
            if (issueDetails.getReporterId() != null) issue.setReporterId(issueDetails.getReporterId());
            if (issueDetails.getReporterName() != null) issue.setReporterName(issueDetails.getReporterName());
            if (issueDetails.getModule() != null) issue.setModule(issueDetails.getModule());
            if (issueDetails.getProjectId() != null) issue.setProjectId(issueDetails.getProjectId());
            if (issueDetails.getProjectName() != null) issue.setProjectName(issueDetails.getProjectName());
            if (issueDetails.getLinkedTaskId() != null) issue.setLinkedTaskId(issueDetails.getLinkedTaskId());
            if (issueDetails.getLinkedTaskTitle() != null) issue.setLinkedTaskTitle(issueDetails.getLinkedTaskTitle());
            if (issueDetails.getStartDate() != null) issue.setStartDate(issueDetails.getStartDate());
            if (issueDetails.getDueDate() != null) issue.setDueDate(issueDetails.getDueDate());
            if (issueDetails.getEndDate() != null) issue.setEndDate(issueDetails.getEndDate());
            if (issueDetails.getStepsToReproduce() != null) issue.setStepsToReproduce(issueDetails.getStepsToReproduce());
            if (issueDetails.getExpectedResult() != null) issue.setExpectedResult(issueDetails.getExpectedResult());
            if (issueDetails.getActualResult() != null) issue.setActualResult(issueDetails.getActualResult());
            if (issueDetails.getEnvironment() != null) issue.setEnvironment(issueDetails.getEnvironment());
            IssueItem updated = issueRepository.save(issue);
            // Notify newly assigned user when assignee changes
            if (issueDetails.getAssigneeId() != null && !issueDetails.getAssigneeId().isBlank()
                    && !issueDetails.getAssigneeId().equalsIgnoreCase(oldAssignee)) {
                createNotificationForIssue(updated, "Bug Assigned To You");
            }
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable String id) {
        if (issueRepository.existsById(id)) {
            issueRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    private void createNotificationForIssue(IssueItem issue, String notifTitle) {
        String assigneeId = issue.getAssigneeId();
        if (assigneeId == null || assigneeId.isBlank()) return;

        String senderName = issue.getReporterName() != null && !issue.getReporterName().isBlank()
                ? issue.getReporterName() : "Manager";

        Optional<User> userOpt = userRepository.findById(assigneeId);
        if (userOpt.isEmpty()) userOpt = userRepository.findByEmail(assigneeId);
        if (userOpt.isEmpty()) userOpt = userRepository.findByUsername(assigneeId);

        String userId = assigneeId;
        String userEmail = assigneeId;
        String targetName = issue.getAssigneeName() != null ? issue.getAssigneeName() : "you";
        if (userOpt.isPresent()) {
            userId = userOpt.get().getId();
            userEmail = userOpt.get().getEmail();
            targetName = userOpt.get().getName();
        }

        Notification notif = new Notification(
                "NOTIF-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                userId,
                userEmail,
                notifTitle,
                senderName + " assigned bug \"" + issue.getTitle() + "\" (" + issue.getId() + ") to " + targetName + ".",
                senderName,
                null,
                false,
                java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
        );
        notificationRepository.save(notif);
    }
}
