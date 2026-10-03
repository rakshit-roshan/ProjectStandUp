package com.standupflow.repository;

import com.standupflow.model.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, String> {
    List<Sprint> findByProjectId(String projectId);
}
