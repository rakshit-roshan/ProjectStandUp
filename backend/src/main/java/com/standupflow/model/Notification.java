package com.standupflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "notifications")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Notification {

    @Id
    private String id;
    @Column(name = "user_id")
    private String userId;
    @Column(name = "user_email")
    private String userEmail;
    private String title;
    @Column(length = 1000)
    private String message;
    @Column(name = "reporter_name")
    private String reporterName;
    @Column(name = "link_task_id")
    private String linkTaskId;
    @Column(name = "is_read")
    private Boolean isRead = false;
    private String timestamp;

    public Notification() {}

    public Notification(String id, String userId, String userEmail, String title, String message, String reporterName, String linkTaskId, Boolean isRead, String timestamp) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.title = title;
        this.message = message;
        this.reporterName = reporterName;
        this.linkTaskId = linkTaskId;
        this.isRead = isRead != null ? isRead : false;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getLinkTaskId() { return linkTaskId; }
    public void setLinkTaskId(String linkTaskId) { this.linkTaskId = linkTaskId; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
