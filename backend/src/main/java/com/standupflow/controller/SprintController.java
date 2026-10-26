package com.standupflow.controller;

import com.standupflow.model.Sprint;
import com.standupflow.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sprints")
public class SprintController {

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private com.standupflow.repository.TaskRepository taskRepository;

    @Autowired
    private com.standupflow.repository.ProjectRepository projectRepository;

    @GetMapping
    public List<Sprint> getAllSprints(
            @RequestParam(required = false) String projectId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Rootadmin", required = false) String rootAdminStr
    ) {
        List<Sprint> list = (projectId != null && !projectId.isBlank())
                ? sprintRepository.findByProjectId(projectId.trim())
                : sprintRepository.findAll();

        boolean isRootAdmin = "1".equals(rootAdminStr) || "true".equalsIgnoreCase(rootAdminStr);
        boolean isManagerOrAdmin = isRootAdmin ||
                "1".equalsIgnoreCase(userRole) || "2".equalsIgnoreCase(userRole) ||
                "ADMIN".equalsIgnoreCase(userRole) || "MANAGER".equalsIgnoreCase(userRole);
        if (isManagerOrAdmin) {
            return list;
        }

        String finalUserId = userId != null ? userId.trim() : "";
        String finalEmail = userEmail != null ? userEmail.trim().toLowerCase() : "";
        String finalName = userName != null ? userName.trim().toLowerCase() : "";

        // Find sprint IDs where user has assigned tasks
        List<com.standupflow.model.TaskItem> allTasks = taskRepository.findAll();
        java.util.Set<String> visibleSprintIds = allTasks.stream().filter(task -> {
            if (task.getSprintId() == null || task.getSprintId().isBlank()) return false;
            if (task.getAssigneeId() != null && !task.getAssigneeId().isBlank()) {
                String[] parts = task.getAssigneeId().split(",");
                for (String p : parts) {
                    String trimmed = p.trim();
                    if (!trimmed.isEmpty()) {
                        if (!finalUserId.isEmpty() && trimmed.equalsIgnoreCase(finalUserId)) return true;
                        if (!finalEmail.isEmpty() && trimmed.equalsIgnoreCase(finalEmail)) return true;
                    }
                }
            }
            if (task.getAssigneeName() != null && !task.getAssigneeName().isBlank() && !finalName.isEmpty()) {
                String[] parts = task.getAssigneeName().split(",");
                for (String p : parts) {
                    String trimmed = p.trim().toLowerCase();
                    if (!trimmed.isEmpty() && !trimmed.equalsIgnoreCase("unassigned") && trimmed.equalsIgnoreCase(finalName)) {
                        return true;
                    }
                }
            }
            if (!finalUserId.isEmpty() && task.getTesterId() != null && finalUserId.equalsIgnoreCase(task.getTesterId().trim())) return true;
            return false;
        }).map(com.standupflow.model.TaskItem::getSprintId).collect(java.util.stream.Collectors.toSet());

        List<com.standupflow.model.Project> allProjects = projectRepository.findAll();
        java.util.Set<String> visibleProjectIds = allProjects.stream().filter(p -> {
            if (!finalUserId.isEmpty() && p.getMemberIds() != null && !p.getMemberIds().isBlank()) {
                String[] mIds = p.getMemberIds().split(",");
                for (String m : mIds) {
                    if (m.trim().equalsIgnoreCase(finalUserId)) return true;
                }
            }
            if (!finalEmail.isEmpty() && p.getMemberEmails() != null && !p.getMemberEmails().isBlank()) {
                String[] mEmails = p.getMemberEmails().split(",");
                for (String m : mEmails) {
                    if (m.trim().equalsIgnoreCase(finalEmail)) return true;
                }
            }
            if (!finalUserId.isEmpty() && p.getLeadId() != null && p.getLeadId().trim().equalsIgnoreCase(finalUserId)) return true;
            if (!finalName.isEmpty() && p.getLead() != null && p.getLead().trim().equalsIgnoreCase(finalName)) return true;
            return false;
        }).map(com.standupflow.model.Project::getId).collect(java.util.stream.Collectors.toSet());

        return list.stream().filter(s -> visibleSprintIds.contains(s.getId()) || (s.getProjectId() != null && visibleProjectIds.contains(s.getProjectId()))).collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getSprintById(@PathVariable String id) {
        return sprintRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Sprint createSprint(@RequestBody Sprint sprint) {
        if (sprint.getId() == null || sprint.getId().isBlank()) {
            sprint.setId("SPR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (sprint.getStatus() == null || sprint.getStatus().isBlank()) {
            sprint.setStatus("Planning");
        }
        if (sprint.getTotalTasks() == null) sprint.setTotalTasks(0);
        if (sprint.getCompletedTasks() == null) sprint.setCompletedTasks(0);
        if (sprint.getStoryPoints() == null) sprint.setStoryPoints(0);
        if (sprint.getCompletedStoryPoints() == null) sprint.setCompletedStoryPoints(0);
        return sprintRepository.save(sprint);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable String id, @RequestBody Sprint details) {
        return sprintRepository.findById(id).map(existing -> {
            if (details.getName() != null) existing.setName(details.getName());
            if (details.getGoal() != null) existing.setGoal(details.getGoal());
            if (details.getStartDate() != null) existing.setStartDate(details.getStartDate());
            if (details.getEndDate() != null) existing.setEndDate(details.getEndDate());
            if (details.getStatus() != null) existing.setStatus(details.getStatus());
            if (details.getTotalTasks() != null) existing.setTotalTasks(details.getTotalTasks());
            if (details.getCompletedTasks() != null) existing.setCompletedTasks(details.getCompletedTasks());
            if (details.getStoryPoints() != null) existing.setStoryPoints(details.getStoryPoints());
            if (details.getCompletedStoryPoints() != null) existing.setCompletedStoryPoints(details.getCompletedStoryPoints());
            if (details.getProjectId() != null) existing.setProjectId(details.getProjectId());
            if (details.getProjectName() != null) existing.setProjectName(details.getProjectName());
            return ResponseEntity.ok(sprintRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable String id) {
        if (sprintRepository.existsById(id)) {
            sprintRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}

