package com.standupflow.controller;

import com.standupflow.model.IssueItem;
import com.standupflow.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/issues")
public class IssueController {

    @Autowired
    private IssueRepository issueRepository;

    @GetMapping
    public List<IssueItem> getAllIssues() {
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
        return issueRepository.save(issue);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueItem> updateIssue(@PathVariable String id, @RequestBody IssueItem issueDetails) {
        return issueRepository.findById(id).map(issue -> {
            issue.setTitle(issueDetails.getTitle());
            issue.setDescription(issueDetails.getDescription());
            issue.setState(issueDetails.getState());
            issue.setPriority(issueDetails.getPriority());
            issue.setSeverity(issueDetails.getSeverity());
            issue.setAssigneeId(issueDetails.getAssigneeId());
            issue.setAssigneeName(issueDetails.getAssigneeName());
            if (issueDetails.getProjectId() != null) issue.setProjectId(issueDetails.getProjectId());
            if (issueDetails.getProjectName() != null) issue.setProjectName(issueDetails.getProjectName());
            issue.setEndDate(issueDetails.getEndDate());
            return ResponseEntity.ok(issueRepository.save(issue));
        }).orElse(ResponseEntity.notFound().build());
    }
}
