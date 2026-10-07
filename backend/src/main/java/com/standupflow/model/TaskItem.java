package com.standupflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "tasks")
@JsonIgnoreProperties(ignoreUnknown = true)
public class TaskItem {

    @Id
    private String id;
    private String title;
    @Column(length = 2000)
    private String description;
    private String status; // Backlog, In Progress, In Review, Completed
    private String priority; // Critical, High, Medium, Low
    @Column(name = "assignee_id")
    private String assigneeId;
    @Column(name = "assignee_name")
    private String assigneeName;
    @Column(name = "assignee_avatar")
    private String assigneeAvatar;
    @Column(name = "reporter_id")
    private String reporterId;
    @Column(name = "reporter_name")
    private String reporterName;
    @Column(name = "sprint_id")
    private String sprintId;
    @Column(name = "sprint_name")
    private String sprintName;
    @Column(name = "project_id")
    private String projectId;
    @Column(name = "project_name")
    private String projectName;
    @Column(name = "story_points")
    private Integer storyPoints;
    @Column(name = "start_date")
    private String startDate;
    @Column(name = "due_date")
    private String dueDate;
    @Column(name = "updated_at")
    private String updatedAt;
    @Column(name = "testing_status")
    private String testingStatus; // Pending Testing, In Testing, Passed, Failed, Blocked
    @Column(name = "tester_id")
    private String testerId;
    @Column(name = "tester_name")
    private String testerName;
    @Column(name = "has_issue")
    private Boolean hasIssue;

    public TaskItem() {}

    public TaskItem(String id, String title, String description, String status, String priority, String assigneeId, String assigneeName, String assigneeAvatar, String reporterId, String reporterName, String sprintId, String sprintName, String projectId, String projectName, Integer storyPoints, String startDate, String dueDate, String updatedAt, String testingStatus, String testerId, String testerName, Boolean hasIssue) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.assigneeId = assigneeId;
        this.assigneeName = assigneeName;
        this.assigneeAvatar = assigneeAvatar;
        this.reporterId = reporterId;
        this.reporterName = reporterName;
        this.sprintId = sprintId;
        this.sprintName = sprintName;
        this.projectId = projectId;
        this.projectName = projectName;
        this.storyPoints = storyPoints;
        this.startDate = startDate;
        this.dueDate = dueDate;
        this.updatedAt = updatedAt;
        this.testingStatus = testingStatus;
        this.testerId = testerId;
        this.testerName = testerName;
        this.hasIssue = hasIssue;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getAssigneeId() { return assigneeId; }
    public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }

    public String getAssigneeName() { return assigneeName; }
    public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }

    public String getAssigneeAvatar() { return assigneeAvatar; }
    public void setAssigneeAvatar(String assigneeAvatar) { this.assigneeAvatar = assigneeAvatar; }

    public String getReporterId() { return reporterId; }
    public void setReporterId(String reporterId) { this.reporterId = reporterId; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getSprintId() { return sprintId; }
    public void setSprintId(String sprintId) { this.sprintId = sprintId; }

    public String getSprintName() { return sprintName; }
    public void setSprintName(String sprintName) { this.sprintName = sprintName; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getTestingStatus() { return testingStatus; }
    public void setTestingStatus(String testingStatus) { this.testingStatus = testingStatus; }

    public String getTesterId() { return testerId; }
    public void setTesterId(String testerId) { this.testerId = testerId; }

    public String getTesterName() { return testerName; }
    public void setTesterName(String testerName) { this.testerName = testerName; }

    public Boolean getHasIssue() { return hasIssue; }
    public void setHasIssue(Boolean hasIssue) { this.hasIssue = hasIssue; }
}
