package com.standupflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tblUser_metrics")
public class UserMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private String userId;

    private String workload = "Balanced";
    private Integer assignedTasksCount = 0;
    private Integer completedTasksCount = 0;
    private Integer pendingReviewsCount = 0;
    private Double loggedHoursThisWeek = 0.0;
    private Integer onTimeDeliveryRate = 100;
    private Integer reopenedBugsCount = 0;
    private Boolean isOnline = false;

    private String modifiedDatetime = LocalDateTime.now().toString();

    public UserMetrics() {}

    public UserMetrics(String userId) {
        this.userId = userId;
        this.workload = "Balanced";
        this.assignedTasksCount = 0;
        this.completedTasksCount = 0;
        this.pendingReviewsCount = 0;
        this.loggedHoursThisWeek = 0.0;
        this.onTimeDeliveryRate = 100;
        this.reopenedBugsCount = 0;
        this.isOnline = false;
        this.modifiedDatetime = LocalDateTime.now().toString();
    }

    public UserMetrics(String userId, String workload, Integer assignedTasksCount, Integer completedTasksCount, Integer pendingReviewsCount, Double loggedHoursThisWeek, Integer onTimeDeliveryRate, Integer reopenedBugsCount, Boolean isOnline) {
        this.userId = userId;
        this.workload = workload != null ? workload : "Balanced";
        this.assignedTasksCount = assignedTasksCount != null ? assignedTasksCount : 0;
        this.completedTasksCount = completedTasksCount != null ? completedTasksCount : 0;
        this.pendingReviewsCount = pendingReviewsCount != null ? pendingReviewsCount : 0;
        this.loggedHoursThisWeek = loggedHoursThisWeek != null ? loggedHoursThisWeek : 0.0;
        this.onTimeDeliveryRate = onTimeDeliveryRate != null ? onTimeDeliveryRate : 100;
        this.reopenedBugsCount = reopenedBugsCount != null ? reopenedBugsCount : 0;
        this.isOnline = isOnline != null ? isOnline : false;
        this.modifiedDatetime = LocalDateTime.now().toString();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

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

    public Boolean getIsOnline() { return isOnline; }
    public void setIsOnline(Boolean isOnline) { this.isOnline = isOnline; }

    public String getModifiedDatetime() { return modifiedDatetime; }
    public void setModifiedDatetime(String modifiedDatetime) { this.modifiedDatetime = modifiedDatetime; }
}
