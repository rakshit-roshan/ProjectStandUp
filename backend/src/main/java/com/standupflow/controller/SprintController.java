package com.standupflow.controller;

import com.standupflow.model.Sprint;
import com.standupflow.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sprints")
public class SprintController {

    @Autowired
    private SprintRepository sprintRepository;

    @GetMapping
    public List<Sprint> getAllSprints() {
        return sprintRepository.findAll();
    }

    @PostMapping
    public Sprint createSprint(@RequestBody Sprint sprint) {
        return sprintRepository.save(sprint);
    }
}
