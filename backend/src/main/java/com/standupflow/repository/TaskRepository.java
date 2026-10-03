package com.standupflow.repository;

import com.standupflow.model.TaskItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<TaskItem, String> {
    List<TaskItem> findByAssigneeId(String assigneeId);
    List<TaskItem> findBySprintId(String sprintId);
    List<TaskItem> findByProjectId(String projectId);
    List<TaskItem> findByStatus(String status);
}
