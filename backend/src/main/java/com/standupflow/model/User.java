package com.standupflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    private String id;
    private String name;
    @Column(unique = true, nullable = false)
    private String email;
    private String password;
    private String role; // MANAGER, DEVELOPER, TESTER
    @Column(columnDefinition = "LONGTEXT")
    private String avatar;
    private String department;
    private String workload; // Balanced, High, Overloaded
    private Integer assignedTasksCount = 0;
    private Integer completedTasksCount = 0;
    private Integer pendingReviewsCount = 0;
    private Double loggedHoursThisWeek = 0.0;
    private Integer onTimeDeliveryRate = 100;
    private Integer reopenedBugsCount = 0;
    private Boolean hasCompletedTour = false;

    // Unique Hash Code for Manager Teams
    private String managerCode; 
    private Boolean isOnline = false;

    public User() {}

    public User(String id, String name, String email, String password, String role, String avatar, String department, String workload, Integer assignedTasksCount, Integer completedTasksCount, Integer pendingReviewsCount, Double loggedHoursThisWeek, Integer onTimeDeliveryRate, Integer reopenedBugsCount, Boolean hasCompletedTour, String managerCode) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.avatar = avatar;
        this.department = department;
        this.workload = workload;
        this.assignedTasksCount = assignedTasksCount;
        this.completedTasksCount = completedTasksCount;
        this.pendingReviewsCount = pendingReviewsCount;
        this.loggedHoursThisWeek = loggedHoursThisWeek;
        this.onTimeDeliveryRate = onTimeDeliveryRate;
        this.reopenedBugsCount = reopenedBugsCount;
        this.hasCompletedTour = hasCompletedTour;
        this.managerCode = managerCode;
        this.isOnline = false;
    }

    public User(String id, String name, String email, String password, String role, String avatar, String department, String workload, Integer assignedTasksCount, Integer completedTasksCount, Integer pendingReviewsCount, Double loggedHoursThisWeek, Integer onTimeDeliveryRate, Integer reopenedBugsCount, Boolean hasCompletedTour, String managerCode, Boolean isOnline) {
        this(id, name, email, password, role, avatar, department, workload, assignedTasksCount, completedTasksCount, pendingReviewsCount, loggedHoursThisWeek, onTimeDeliveryRate, reopenedBugsCount, hasCompletedTour, managerCode);
        this.isOnline = isOnline;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { 
        if ("MANAGER".equalsIgnoreCase(role) || "DEVELOPER".equalsIgnoreCase(role)) {
            return "ENGINEER";
        }
        return role; 
    }
    public void setRole(String role) { 
        if ("MANAGER".equalsIgnoreCase(role) || "DEVELOPER".equalsIgnoreCase(role)) {
            this.role = "ENGINEER";
        } else {
            this.role = role; 
        }
    }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getWorkload() { return workload; }
    public void setWorkload(String workload) { this.workload = workload; }

    public Integer getAssignedTasksCount() { return assignedTasksCount; }
    public void setAssignedTasksCount(Integer assignedTasksCount) { this.assignedTasksCount = assignedTasksCount; }

    public Integer getCompletedTasksCount() { return completedTasksCount; }
    public void setCompletedTasksCount(Integer completedTasksCount) { this.completedTasksCount = completedTasksCount; }

    public Integer getPendingReviewsCount() { return pendingReviewsCount; }
    public void setPendingReviewsCount(Integer pendingReviewsCount) { this.pendingReviewsCount = pendingReviewsCount; }

    public Double getLoggedHoursThisWeek() { return loggedHoursThisWeek; }
    public void setLoggedHoursThisWeek(Double loggedHoursThisWeek) { this.loggedHoursThisWeek = loggedHoursThisWeek; }

    public Integer getOnTimeDeliveryRate() { return onTimeDeliveryRate; }
    public void setOnTimeDeliveryRate(Integer onTimeDeliveryRate) { this.onTimeDeliveryRate = onTimeDeliveryRate; }

    public Integer getReopenedBugsCount() { return reopenedBugsCount; }
    public void setReopenedBugsCount(Integer reopenedBugsCount) { this.reopenedBugsCount = reopenedBugsCount; }

    public Boolean getHasCompletedTour() { return hasCompletedTour; }
    public void setHasCompletedTour(Boolean hasCompletedTour) { this.hasCompletedTour = hasCompletedTour; }

    public String getManagerCode() { return managerCode; }
    public void setManagerCode(String managerCode) { this.managerCode = managerCode; }

    public Boolean getIsOnline() { return isOnline; }
    public void setIsOnline(Boolean isOnline) { this.isOnline = isOnline; }
}
