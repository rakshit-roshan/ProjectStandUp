package com.standupflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "sprints")
public class Sprint {

    @Id
    private String id;
    private String name;
    @Column(name = "project_id")
    private String projectId;
    @Column(name = "project_name")
    private String projectName;
    @Column(length = 1000)
    private String goal;
    @Column(name = "start_date")
    private String startDate;
    @Column(name = "end_date")
    private String endDate;
    private String status; // Active, Planning, Completed
    @Column(name = "total_tasks")
    private Integer totalTasks;
    @Column(name = "completed_tasks")
    private Integer completedTasks;
    @Column(name = "story_points")
    private Integer storyPoints;
    @Column(name = "completed_story_points")
    private Integer completedStoryPoints;

    public Sprint() {}

    public Sprint(String id, String name, String projectId, String projectName, String goal, String startDate, String endDate, String status, Integer totalTasks, Integer completedTasks, Integer storyPoints, Integer completedStoryPoints) {
        this.id = id;
        this.name = name;
        this.projectId = projectId;
        this.projectName = projectName;
        this.goal = goal;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.storyPoints = storyPoints;
        this.completedStoryPoints = completedStoryPoints;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getTotalTasks() { return totalTasks; }
    public void setTotalTasks(Integer totalTasks) { this.totalTasks = totalTasks; }

    public Integer getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(Integer completedTasks) { this.completedTasks = completedTasks; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public Integer getCompletedStoryPoints() { return completedStoryPoints; }
    public void setCompletedStoryPoints(Integer completedStoryPoints) { this.completedStoryPoints = completedStoryPoints; }
}
