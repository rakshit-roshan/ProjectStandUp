package com.standupflow.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

@Entity
@Table(name = "requirements")
public class Requirement {

    @Id
    private String id;

    private String title;

    @Column(length = 4000)
    private String description;

    private String priority; // Critical, High, Medium, Low
    private String category; // Feature, Enhancement, Client Request, Bugfix, Security
    
    @Column(name = "project_id")
    private String projectId;

    @Column(name = "project_name")
    private String projectName;

    @Column(name = "sprint_id")
    private String sprintId;

    @Column(name = "sprint_name")
    private String sprintName;

    @Column(name = "assignee_id")
    private String assigneeId;

    @Column(name = "assignee_name")
    private String assigneeName;

    // Join with tblUser_details on assignee_id in a single SQL query
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assignee_id", referencedColumnName = "id", insertable = false, updatable = false)
    @NotFound(action = NotFoundAction.IGNORE)
    @JsonIgnore
    private User assigneeUser;

    private String status; // Submitted, Under Review, Moved to Sprint, Converted to Task, Completed

    @Column(name = "converted_task_id")
    private String convertedTaskId;

    @Column(name = "created_by_user_id")
    private String createdByUserId;

    @Column(name = "created_by_name")
    private String createdByName;

    // Join with tblUser_details on created_by_user_id in a single SQL query
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by_user_id", referencedColumnName = "id", insertable = false, updatable = false)
    @NotFound(action = NotFoundAction.IGNORE)
    @JsonIgnore
    private User createdByUser;

    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "updated_at")
    private String updatedAt;

    @Column(name = "attachments_json", columnDefinition = "LONGTEXT")
    private String attachmentsJson;

    public Requirement() {}

    public Requirement(String id, String title, String description, String priority, String category, String projectId, String projectName, String sprintId, String sprintName, String assigneeId, String assigneeName, String assigneeAvatar, String status, String convertedTaskId, String createdByUserId, String createdByName, String createdByAvatar, String createdAt, String updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.category = category;
        this.projectId = projectId;
        this.projectName = projectName;
        this.sprintId = sprintId;
        this.sprintName = sprintName;
        this.assigneeId = assigneeId;
        this.assigneeName = assigneeName;
        this.status = status;
        this.convertedTaskId = convertedTaskId;
        this.createdByUserId = createdByUserId;
        this.createdByName = createdByName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getSprintId() {
        return sprintId;
    }

    public void setSprintId(String sprintId) {
        this.sprintId = sprintId;
    }

    public String getSprintName() {
        return sprintName;
    }

    public void setSprintName(String sprintName) {
        this.sprintName = sprintName;
    }

    public String getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(String assigneeId) {
        this.assigneeId = assigneeId;
    }

    public String getAssigneeName() {
        if (assigneeUser != null && assigneeUser.getName() != null && !assigneeUser.getName().isBlank()) {
            return assigneeUser.getName();
        }
        return assigneeName;
    }

    public void setAssigneeName(String assigneeName) {
        this.assigneeName = assigneeName;
    }

    @Transient
    public String getAssigneeAvatar() {
        if (assigneeUser != null && assigneeUser.getAvatar() != null && !assigneeUser.getAvatar().isBlank()) {
            return assigneeUser.getAvatar();
        }
        return null;
    }

    public void setAssigneeAvatar(String assigneeAvatar) {
        // No-op transient setter: avatar is stored exclusively in tblUser_details
    }

    public User getAssigneeUser() {
        return assigneeUser;
    }

    public void setAssigneeUser(User assigneeUser) {
        this.assigneeUser = assigneeUser;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getConvertedTaskId() {
        return convertedTaskId;
    }

    public void setConvertedTaskId(String convertedTaskId) {
        this.convertedTaskId = convertedTaskId;
    }

    public String getCreatedByUserId() {
        return createdByUserId;
    }

    public void setCreatedByUserId(String createdByUserId) {
        this.createdByUserId = createdByUserId;
    }

    public String getCreatedByName() {
        if (createdByUser != null && createdByUser.getName() != null && !createdByUser.getName().isBlank()) {
            return createdByUser.getName();
        }
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    @Transient
    public String getCreatedByAvatar() {
        if (createdByUser != null && createdByUser.getAvatar() != null && !createdByUser.getAvatar().isBlank()) {
            return createdByUser.getAvatar();
        }
        return null;
    }

    public void setCreatedByAvatar(String createdByAvatar) {
        // No-op transient setter: avatar is stored exclusively in tblUser_details
    }

    public User getCreatedByUser() {
        return createdByUser;
    }

    public void setCreatedByUser(User createdByUser) {
        this.createdByUser = createdByUser;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getAttachmentsJson() {
        return attachmentsJson;
    }

    public void setAttachmentsJson(String attachmentsJson) {
        this.attachmentsJson = attachmentsJson;
    }
}
