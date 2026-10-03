package com.standupflow.repository;

import com.standupflow.model.IssueItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<IssueItem, String> {
    List<IssueItem> findByAssigneeId(String assigneeId);
    List<IssueItem> findByState(String state);
}
