package com.standupflow.controller;

import com.standupflow.model.Invitation;
import com.standupflow.model.Project;
import com.standupflow.model.User;
import com.standupflow.repository.InvitationRepository;
import com.standupflow.repository.ProjectRepository;
import com.standupflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/invitations")
public class InvitationController {

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    // Get All Invitations
    @GetMapping
    public ResponseEntity<List<Invitation>> getAllInvitations() {
        return ResponseEntity.ok(invitationRepository.findAll());
    }

    // Send Team Invitation
    @PostMapping("/send")
    public ResponseEntity<?> sendInvitation(@RequestBody Map<String, String> body) {
        String managerId = body.get("managerId");
        String managerName = body.get("managerName");
        String managerCode = body.get("managerCode");
        String projectId = body.get("projectId");
        String inviteeEmail = body.get("inviteeEmail");

        if (inviteeEmail == null || inviteeEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invitee email is required"));
        }

        String email = inviteeEmail.trim().toLowerCase();
        String code = managerCode != null ? managerCode.trim().toUpperCase() : "PRJ-CODE";

        if (projectId == null || projectId.trim().isEmpty()) {
            List<Project> projects = projectRepository.findAll();
            for (Project p : projects) {
                if ((p.getInviteCode() != null && p.getInviteCode().equalsIgnoreCase(code)) ||
                    (p.getCode() != null && p.getCode().equalsIgnoreCase(code)) ||
                    (p.getLeadId() != null && p.getLeadId().equals(managerId))) {
                    projectId = p.getId();
                    break;
                }
            }
        }

        // Create Invitation Record
        Invitation invitation = new Invitation(
                "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                managerId,
                managerName,
                code,
                projectId,
                email,
                "PENDING",
                LocalDateTime.now()
        );

        Invitation saved = invitationRepository.save(invitation);

        return ResponseEntity.ok(saved);
    }

    // Get Pending Invitations for a User by Email
    @GetMapping("/user")
    public ResponseEntity<List<Invitation>> getPendingInvitationsForUser(@RequestParam String email) {
        if (email == null) return ResponseEntity.badRequest().build();
        List<Invitation> list = invitationRepository.findByInviteeEmailAndStatus(email.trim().toLowerCase(), "PENDING");
        return ResponseEntity.ok(list);
    }

    // Get All Invitations sent by a Manager
    @GetMapping("/manager/{managerCode}")
    public ResponseEntity<List<Invitation>> getInvitationsByManager(@PathVariable String managerCode) {
        List<Invitation> list = invitationRepository.findByManagerCode(managerCode.trim().toUpperCase());
        return ResponseEntity.ok(list);
    }

    // Get All Invitations for a Project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Invitation>> getInvitationsByProject(@PathVariable String projectId) {
        List<Invitation> list = invitationRepository.findByProjectId(projectId);
        return ResponseEntity.ok(list);
    }

    // Accept Invitation
    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptInvitation(@PathVariable String id, @RequestBody Map<String, String> body) {
        String userEmail = body.get("email");
        return invitationRepository.findById(id).map(inv -> {
            inv.setStatus("ACCEPTED");
            invitationRepository.save(inv);

            String finalEmail = (userEmail != null && !userEmail.trim().isEmpty()) 
                    ? userEmail.trim().toLowerCase() 
                    : inv.getInviteeEmail().trim().toLowerCase();

            Optional<User> userOpt = userRepository.findByEmail(finalEmail);
            userOpt.ifPresent(user -> {
                user.setManagerCode(inv.getManagerCode());
                userRepository.save(user);
            });

            // Find matching project to update memberEmails and memberIds
            List<Project> allProjects = projectRepository.findAll();
            Project targetProject = null;

            if (inv.getProjectId() != null && !inv.getProjectId().trim().isEmpty()) {
                targetProject = projectRepository.findById(inv.getProjectId()).orElse(null);
            }

            if (targetProject == null) {
                for (Project p : allProjects) {
                    if ((p.getInviteCode() != null && p.getInviteCode().equalsIgnoreCase(inv.getManagerCode())) ||
                        (p.getCode() != null && p.getCode().equalsIgnoreCase(inv.getManagerCode()))) {
                        targetProject = p;
                        break;
                    }
                }
            }

            if (targetProject != null) {
                String emailsStr = targetProject.getMemberEmails();
                List<String> emails = emailsStr != null && !emailsStr.isBlank()
                        ? new ArrayList<>(Arrays.asList(emailsStr.split(","))) 
                        : new ArrayList<>();
                emails.removeIf(String::isBlank);
                if (!emails.contains(finalEmail)) {
                    emails.add(finalEmail);
                }
                targetProject.setMemberEmails(String.join(",", emails));

                if (userOpt.isPresent()) {
                    String userId = userOpt.get().getId();
                    String idsStr = targetProject.getMemberIds();
                    List<String> ids = idsStr != null && !idsStr.isBlank()
                            ? new ArrayList<>(Arrays.asList(idsStr.split(","))) 
                            : new ArrayList<>();
                    ids.removeIf(String::isBlank);
                    if (!ids.contains(userId)) {
                        ids.add(userId);
                    }
                    targetProject.setMemberIds(String.join(",", ids));
                }

                projectRepository.save(targetProject);
            }

            return ResponseEntity.ok(Map.of("success", true, "managerCode", inv.getManagerCode()));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Decline Invitation
    @PostMapping("/{id}/decline")
    public ResponseEntity<?> declineInvitation(@PathVariable String id) {
        return invitationRepository.findById(id).map(inv -> {
            inv.setStatus("DECLINED");
            invitationRepository.save(inv);
            return ResponseEntity.ok(Map.of("success", true));
        }).orElse(ResponseEntity.notFound().build());
    }
}
