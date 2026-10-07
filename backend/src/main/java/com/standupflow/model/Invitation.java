package com.standupflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invitations")
public class Invitation {

    @Id
    private String id;

    @Column(name = "manager_id")
    private String managerId;
    @Column(name = "manager_name")
    private String managerName;
    @Column(name = "manager_code")
    private String managerCode;
    @Column(name = "project_id")
    private String projectId;
    
    @Column(name = "invitee_email", nullable = false)
    private String inviteeEmail;

    private String status; // PENDING, ACCEPTED, DECLINED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Invitation() {}

    public Invitation(String id, String managerId, String managerName, String managerCode, String projectId, String inviteeEmail, String status, LocalDateTime createdAt) {
        this.id = id;
        this.managerId = managerId;
        this.managerName = managerName;
        this.managerCode = managerCode;
        this.projectId = projectId;
        this.inviteeEmail = inviteeEmail;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getManagerId() { return managerId; }
    public void setManagerId(String managerId) { this.managerId = managerId; }

    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }

    public String getManagerCode() { return managerCode; }
    public void setManagerCode(String managerCode) { this.managerCode = managerCode; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getInviteeEmail() { return inviteeEmail; }
    public void setInviteeEmail(String inviteeEmail) { this.inviteeEmail = inviteeEmail; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
