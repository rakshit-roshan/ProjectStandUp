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
        project.setId(id);
        return projectRepository.save(project);
    }

    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable String id) {
        projectRepository.deleteById(id);
    }
}
