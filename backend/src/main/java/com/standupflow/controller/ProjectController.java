package com.standupflow.controller;

import com.standupflow.model.Project;
import com.standupflow.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private com.standupflow.repository.TaskRepository taskRepository;

    @GetMapping
    public List<Project> getAllProjects(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Rootadmin", required = false) String rootAdminStr
    ) {
        List<Project> all = projectRepository.findAll();

        boolean isRootAdmin = "1".equals(rootAdminStr) || "true".equalsIgnoreCase(rootAdminStr);
        if (isRootAdmin) {
            return all;
        }

        String finalUserId = userId != null ? userId.trim() : "";
        String finalEmail = userEmail != null ? userEmail.trim().toLowerCase() : "";
        String finalName = userName != null ? userName.trim().toLowerCase() : "";

        // Find projects where user has assigned tasks
        List<com.standupflow.model.TaskItem> allTasks = taskRepository.findAll();
        java.util.Set<String> projectIdsWithTasks = allTasks.stream().filter(task -> {
            if (task.getProjectId() == null || task.getProjectId().isBlank()) return false;
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
        }).map(com.standupflow.model.TaskItem::getProjectId).collect(java.util.stream.Collectors.toSet());

        return all.stream().filter(p -> {
            if (projectIdsWithTasks.contains(p.getId())) return true;
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
        }).collect(java.util.stream.Collectors.toList());
    }

    @PostMapping
    public Project createProject(@RequestBody Project project) {
        return projectRepository.save(project);
    }

    @PutMapping("/{id}")
    public Project updateProject(@PathVariable String id, @RequestBody Project project) {
        return projectRepository.findById(id).map(existing -> {
            if (project.getName() != null) existing.setName(project.getName());
            if (project.getCode() != null) existing.setCode(project.getCode());
            if (project.getDescription() != null) existing.setDescription(project.getDescription());
            if (project.getStatus() != null) existing.setStatus(project.getStatus());
            if (project.getColor() != null) existing.setColor(project.getColor());
            if (project.getLead() != null) existing.setLead(project.getLead());
            if (project.getLeadId() != null) existing.setLeadId(project.getLeadId());
            if (project.getInviteCode() != null) existing.setInviteCode(project.getInviteCode());
            if (project.getMemberEmails() != null) existing.setMemberEmails(project.getMemberEmails());
            if (project.getMemberIds() != null) existing.setMemberIds(project.getMemberIds());
            if (project.getSprintCompletion() != null) existing.setSprintCompletion(project.getSprintCompletion());
            if (project.getTotalTasks() != null) existing.setTotalTasks(project.getTotalTasks());
            if (project.getCompletedTasks() != null) existing.setCompletedTasks(project.getCompletedTasks());
            if (project.getOpenIssues() != null) existing.setOpenIssues(project.getOpenIssues());
            if (project.getOverdueTasks() != null) existing.setOverdueTasks(project.getOverdueTasks());
            return projectRepository.save(existing);
        }).orElseGet(() -> {
            project.setId(id);
            return projectRepository.save(project);
        });
    }

    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable String id) {
        projectRepository.deleteById(id);
    }
}
