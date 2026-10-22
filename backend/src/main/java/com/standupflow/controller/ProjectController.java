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

    @Autowired
    private com.standupflow.repository.UserRepository userRepository;

    @Autowired
    private com.standupflow.repository.InvitationRepository invitationRepository;

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
    public org.springframework.http.ResponseEntity<?> createProject(
            @RequestBody Project project,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Rootadmin", required = false) String rootAdminStr
    ) {
        boolean isRootAdmin = "1".equals(rootAdminStr) || "true".equalsIgnoreCase(rootAdminStr);
        int roleCode = -1;
        try {
            if (userRole != null) roleCode = Integer.parseInt(userRole.trim());
        } catch (Exception ignored) {}

        boolean isAdminOrManager = isRootAdmin || roleCode == 1 || roleCode == 2;
        if (!isAdminOrManager && roleCode > 0) {
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body("Only workspace administrators or managers can create new projects.");
        }
        return org.springframework.http.ResponseEntity.ok(projectRepository.save(project));
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

    @DeleteMapping("/{projectId}/members/{userId}")
    public org.springframework.http.ResponseEntity<?> removeMemberFromProject(
            @PathVariable String projectId,
            @PathVariable String userId) {
        return projectRepository.findById(projectId).map(project -> {
            java.util.Optional<com.standupflow.model.User> userOpt = userRepository.findById(userId);
            String userEmail = userOpt.map(com.standupflow.model.User::getEmail).orElse("").trim().toLowerCase();

            // 1. Remove from memberIds
            if (project.getMemberIds() != null && !project.getMemberIds().isBlank()) {
                java.util.List<String> ids = new java.util.ArrayList<>(java.util.Arrays.asList(project.getMemberIds().split(",")));
                ids.removeIf(id -> id.trim().equals(userId.trim()));
                project.setMemberIds(String.join(",", ids));
            }

            // 2. Remove from memberEmails
            if (project.getMemberEmails() != null && !project.getMemberEmails().isBlank() && !userEmail.isEmpty()) {
                java.util.List<String> emails = new java.util.ArrayList<>(java.util.Arrays.asList(project.getMemberEmails().split(",")));
                emails.removeIf(e -> e.trim().equalsIgnoreCase(userEmail));
                project.setMemberEmails(String.join(",", emails));
            }
            projectRepository.save(project);

            // 3. Clear managerCode on User if it matches this project
            userOpt.ifPresent(user -> {
                String uCode = user.getManagerCode();
                if (uCode != null && (uCode.equalsIgnoreCase(project.getInviteCode()) || uCode.equalsIgnoreCase(project.getCode()))) {
                    user.setManagerCode(null);
                    userRepository.save(user);
                }
            });

            // 4. Update/Delete any Invitation records for this user and project
            if (!userEmail.isEmpty()) {
                java.util.List<com.standupflow.model.Invitation> userInvs = invitationRepository.findByInviteeEmail(userEmail);
                for (com.standupflow.model.Invitation inv : userInvs) {
                    if (projectId.equals(inv.getProjectId()) 
                            || (project.getInviteCode() != null && project.getInviteCode().equalsIgnoreCase(inv.getManagerCode()))
                            || (project.getCode() != null && project.getCode().equalsIgnoreCase(inv.getManagerCode()))) {
                        inv.setStatus("REMOVED");
                        invitationRepository.save(inv);
                    }
                }
            }

            return org.springframework.http.ResponseEntity.ok(project);
        }).orElse(org.springframework.http.ResponseEntity.notFound().build());
    }
}
