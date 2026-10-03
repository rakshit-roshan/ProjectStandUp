package com.standupflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "issues")
public class IssueItem {

    @Id
    private String id;
    private String title;
    @Column(length = 2000)
    private String description;
    private String state; // Pending, In Progress, Done
    private String priority; // Critical, High, Medium, Low
    private String severity;
    private String assigneeId;
    private String assigneeName;
    private String assigneeAvatar;
    private String reporterId;
    private String reporterName;
    private String module;
    private String projectId;
    private String projectName;
    private String linkedTaskId;
    private String linkedTaskTitle;
    private String startDate;
    private String dueDate;
    private String endDate;
    @Column(length = 2000)
    private String stepsToReproduce;
    private String expectedResult;
    private String actualResult;
    private String environment;

    public IssueItem() {}

    public IssueItem(String id, String title, String description, String state, String priority, String severity, String assigneeId, String assigneeName, String assigneeAvatar, String reporterId, String reporterName, String module, String linkedTaskId, String linkedTaskTitle, String startDate, String dueDate, String endDate, String stepsToReproduce, String expectedResult, String actualResult, String environment) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.state = state;
        this.priority = priority;
        this.severity = severity;
        this.assigneeId = assigneeId;
        this.assigneeName = assigneeName;
        this.assigneeAvatar = assigneeAvatar;
        this.reporterId = reporterId;
        this.reporterName = reporterName;
        this.module = module;
        this.linkedTaskId = linkedTaskId;
        this.linkedTaskTitle = linkedTaskTitle;
        this.startDate = startDate;
        this.dueDate = dueDate;
        this.endDate = endDate;
        this.stepsToReproduce = stepsToReproduce;
        this.expectedResult = expectedResult;
        this.actualResult = actualResult;
        this.environment = environment;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

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

    public String getModule() { return module; }
    public void setModule(String module) { this.module = module; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getLinkedTaskId() { return linkedTaskId; }
    public void setLinkedTaskId(String linkedTaskId) { this.linkedTaskId = linkedTaskId; }

    public String getLinkedTaskTitle() { return linkedTaskTitle; }
    public void setLinkedTaskTitle(String linkedTaskTitle) { this.linkedTaskTitle = linkedTaskTitle; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getStepsToReproduce() { return stepsToReproduce; }
    public void setStepsToReproduce(String stepsToReproduce) { this.stepsToReproduce = stepsToReproduce; }

    public String getExpectedResult() { return expectedResult; }
    public void setExpectedResult(String expectedResult) { this.expectedResult = expectedResult; }

    public String getActualResult() { return actualResult; }
    public void setActualResult(String actualResult) { this.actualResult = actualResult; }

    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }
}
