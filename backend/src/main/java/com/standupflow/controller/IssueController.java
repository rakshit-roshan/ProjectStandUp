package com.standupflow.controller;

import com.standupflow.model.IssueItem;
import com.standupflow.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/issues")
public class IssueController {

    @Autowired
    private IssueRepository issueRepository;

    @GetMapping
    public List<IssueItem> getAllIssues(@RequestParam(required = false) String projectId) {
        if (projectId != null && !projectId.isBlank()) {
            return issueRepository.findByProjectId(projectId.trim());
        }
        return issueRepository.findAll();
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
        return issueRepository.save(issue);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueItem> updateIssue(@PathVariable String id, @RequestBody IssueItem issueDetails) {
        return issueRepository.findById(id).map(issue -> {
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
            return ResponseEntity.ok(issueRepository.save(issue));
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
}

