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

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
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
