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

    @GetMapping
    public List<Sprint> getAllSprints(@RequestParam(required = false) String projectId) {
        if (projectId != null && !projectId.isBlank()) {
            return sprintRepository.findByProjectId(projectId.trim());
        }
        return sprintRepository.findAll();
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

