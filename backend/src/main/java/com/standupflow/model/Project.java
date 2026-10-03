package com.standupflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    private String id;
    private String name;
    private String code;
    @Column(length = 1000)
    private String description;
    private String status; // On Track, At Risk, Delayed
    private Integer sprintCompletion;
    private Integer totalTasks;
    private Integer completedTasks;
    private Integer openIssues;
    private Integer overdueTasks;
    private String lead;
    private String leadId;
    private String color;
    private String inviteCode;
    @Column(length = 2000)
    private String memberEmails;
    @Column(length = 2000)
    private String memberIds;

    public Project() {}

    public Project(String id, String name, String code, String description, String status, Integer sprintCompletion, Integer totalTasks, Integer completedTasks, Integer openIssues, Integer overdueTasks, String lead, String color) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.status = status;
        this.sprintCompletion = sprintCompletion;
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.openIssues = openIssues;
        this.overdueTasks = overdueTasks;
        this.lead = lead;
        this.color = color;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getSprintCompletion() { return sprintCompletion; }
    public void setSprintCompletion(Integer sprintCompletion) { this.sprintCompletion = sprintCompletion; }

    public Integer getTotalTasks() { return totalTasks; }
    public void setTotalTasks(Integer totalTasks) { this.totalTasks = totalTasks; }

    public Integer getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(Integer completedTasks) { this.completedTasks = completedTasks; }

    public Integer getOpenIssues() { return openIssues; }
    public void setOpenIssues(Integer openIssues) { this.openIssues = openIssues; }

    public Integer getOverdueTasks() { return overdueTasks; }
    public void setOverdueTasks(Integer overdueTasks) { this.overdueTasks = overdueTasks; }

    public String getLead() { return lead; }
    public void setLead(String lead) { this.lead = lead; }

    public String getLeadId() { return leadId; }
    public void setLeadId(String leadId) { this.leadId = leadId; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getInviteCode() { return inviteCode; }
    public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }

    public String getMemberEmails() { return memberEmails; }
    public void setMemberEmails(String memberEmails) { this.memberEmails = memberEmails; }

    public String getMemberIds() { return memberIds; }
    public void setMemberIds(String memberIds) { this.memberIds = memberIds; }
}
