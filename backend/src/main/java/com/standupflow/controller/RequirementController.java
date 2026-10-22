package com.standupflow.controller;

import com.standupflow.model.Requirement;
import com.standupflow.repository.RequirementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/requirements")
public class RequirementController {

    @Autowired
    private RequirementRepository requirementRepository;

    @GetMapping
    public List<Requirement> getAllRequirements(
            @RequestParam(required = false) String projectId
    ) {
        if (projectId != null && !projectId.isBlank()) {
            return requirementRepository.findByProjectId(projectId.trim());
        }
        return requirementRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Requirement> getRequirementById(@PathVariable String id) {
        return requirementRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createRequirement(@RequestBody Requirement req) {
        try {
            if (req.getId() == null || req.getId().trim().isEmpty()) {
                req.setId("REQ-" + System.currentTimeMillis());
            }
            if (req.getStatus() == null || req.getStatus().trim().isEmpty()) {
                req.setStatus("Submitted");
            }
            if (req.getCreatedAt() == null || req.getCreatedAt().trim().isEmpty()) {
                req.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            }
            req.setUpdatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));

            Requirement saved = requirementRepository.save(req);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to create requirement: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRequirement(@PathVariable String id, @RequestBody Requirement updatedReq) {
        try {
            Optional<Requirement> existingOpt = requirementRepository.findById(id);
            if (existingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Requirement req = existingOpt.get();
            if (updatedReq.getTitle() != null) req.setTitle(updatedReq.getTitle());
            if (updatedReq.getDescription() != null) req.setDescription(updatedReq.getDescription());
            if (updatedReq.getPriority() != null) req.setPriority(updatedReq.getPriority());
            if (updatedReq.getCategory() != null) req.setCategory(updatedReq.getCategory());
            if (updatedReq.getProjectId() != null) req.setProjectId(updatedReq.getProjectId());
            if (updatedReq.getProjectName() != null) req.setProjectName(updatedReq.getProjectName());
            if (updatedReq.getSprintId() != null) req.setSprintId(updatedReq.getSprintId());
            if (updatedReq.getSprintName() != null) req.setSprintName(updatedReq.getSprintName());
            if (updatedReq.getAssigneeId() != null) req.setAssigneeId(updatedReq.getAssigneeId());
            if (updatedReq.getAssigneeName() != null) req.setAssigneeName(updatedReq.getAssigneeName());
            if (updatedReq.getAssigneeAvatar() != null) req.setAssigneeAvatar(updatedReq.getAssigneeAvatar());
            if (updatedReq.getStatus() != null) req.setStatus(updatedReq.getStatus());
            if (updatedReq.getConvertedTaskId() != null) req.setConvertedTaskId(updatedReq.getConvertedTaskId());
            if (updatedReq.getAttachmentsJson() != null) req.setAttachmentsJson(updatedReq.getAttachmentsJson());

            req.setUpdatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));

            Requirement saved = requirementRepository.save(req);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to update requirement: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequirement(@PathVariable String id) {
        try {
            if (!requirementRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            requirementRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to delete requirement: " + e.getMessage());
        }
    }
}
