package com.standupflow.repository;

import com.standupflow.model.Requirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequirementRepository extends JpaRepository<Requirement, String> {
    List<Requirement> findByProjectId(String projectId);
    List<Requirement> findByCreatedByUserId(String createdByUserId);
}
