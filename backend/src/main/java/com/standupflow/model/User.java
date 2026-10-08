package com.standupflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tblUser_details")
public class User {

    @Id
    private String id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String fullname;

    @Column(name = "emailid", unique = true, nullable = false)
    private String emailid;

    @Column(name = "userpassword", nullable = false)
    private String userpassword;

    @Column(name = "role")
    private Integer role = 1; // 1 = ADMIN (Root), 2 = MANAGER, 3 = DEVELOPER, 4 = TESTER

    private Integer rootadmin = 0; // 1 for primary root admin, 0 for others

    private Integer enable = 1; // 1 by default (active), 0 for disabled

    @Column(columnDefinition = "LONGTEXT")
    private String avatar;

    private String department;

    @Column(name = "has_completed_tour")
    private Boolean hasCompletedTour = false;

    @Column(name = "manager_code")
    private String managerCode; 

    @Column(name = "company_id")
    private String companyId;

    @Column(name = "created_datetime")
    private String createdDatetime = LocalDateTime.now().toString();

    @Column(name = "modified_datetime")
    private String modifiedDatetime = LocalDateTime.now().toString();

    @Column(name = "password_history", columnDefinition = "LONGTEXT")
    private String passwordHistory;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "id", referencedColumnName = "user_id", insertable = false, updatable = false)
    private UserMetrics metrics;

    public User() {}

    public User(String id, String username, String fullname, String emailid, String userpassword, Integer roleCode, Integer rootadmin, Integer enable, String avatar, String department, String managerCode, String companyId) {
        this.id = id;
        this.username = username;
        this.fullname = fullname;
        this.emailid = emailid;
        this.userpassword = userpassword;
        this.role = roleCode != null ? roleCode : 1;
        this.rootadmin = rootadmin;
        this.enable = enable;
        this.avatar = avatar;
        this.department = department;
        this.managerCode = managerCode;
        this.companyId = companyId;
        this.createdDatetime = LocalDateTime.now().toString();
        this.modifiedDatetime = LocalDateTime.now().toString();
        this.metrics = new UserMetrics(id);
    }

    public User(String id, String username, String fullname, String emailid, String userpassword, Integer roleCode, Integer rootadmin, Integer enable, String avatar, String department, String workload, Integer assignedTasksCount, Integer completedTasksCount, Integer pendingReviewsCount, Double loggedHoursThisWeek, Integer onTimeDeliveryRate, Integer reopenedBugsCount, Boolean hasCompletedTour, String managerCode, Boolean isOnline, String companyId) {
        this.id = id;
        this.username = username;
        this.fullname = fullname;
        this.emailid = emailid;
        this.userpassword = userpassword;
        this.role = roleCode != null ? roleCode : 1;
        this.rootadmin = rootadmin;
        this.enable = enable;
        this.avatar = avatar;
        this.department = department;
        this.hasCompletedTour = hasCompletedTour;
        this.managerCode = managerCode;
        this.companyId = companyId;
        this.createdDatetime = LocalDateTime.now().toString();
        this.modifiedDatetime = LocalDateTime.now().toString();
        this.metrics = new UserMetrics(id, workload, assignedTasksCount, completedTasksCount, pendingReviewsCount, loggedHoursThisWeek, onTimeDeliveryRate, reopenedBugsCount, isOnline);
    }

    public User(String id, String username, String fullname, String emailid, String userpassword, String roleStr, Integer rootadmin, Integer enable, String avatar, String department, String workload, Integer assignedTasksCount, Integer completedTasksCount, Integer pendingReviewsCount, Double loggedHoursThisWeek, Integer onTimeDeliveryRate, Integer reopenedBugsCount, Boolean hasCompletedTour, String managerCode, Boolean isOnline, String companyId) {
        this.id = id;
        this.username = username;
        this.fullname = fullname;
        this.emailid = emailid;
        this.userpassword = userpassword;
        setRole(roleStr);
        this.rootadmin = rootadmin;
        this.enable = enable;
        this.avatar = avatar;
        this.department = department;
        this.hasCompletedTour = hasCompletedTour;
        this.managerCode = managerCode;
        this.companyId = companyId;
        this.createdDatetime = LocalDateTime.now().toString();
        this.modifiedDatetime = LocalDateTime.now().toString();
        this.metrics = new UserMetrics(id, workload, assignedTasksCount, completedTasksCount, pendingReviewsCount, loggedHoursThisWeek, onTimeDeliveryRate, reopenedBugsCount, isOnline);
    }

    public String getId() { return id; }
    public void setId(String id) { 
        this.id = id; 
        if (this.metrics != null && id != null) this.metrics.setUserId(id);
    }
    public void setId(Long id) {
        this.id = id != null ? id.toString() : null;
        if (this.metrics != null && this.id != null) this.metrics.setUserId(this.id);
    }
    public void setId(Object id) {
        this.id = id != null ? id.toString() : null;
        if (this.metrics != null && this.id != null) this.metrics.setUserId(this.id);
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullname() { return fullname; }
    public void setFullname(String fullname) { this.fullname = fullname; }

    // Alias for JSON / backward compatibility
    public String getName() { return fullname; }
    public void setName(String name) { this.fullname = name; }

    public String getEmailid() { return emailid; }
    public void setEmailid(String emailid) { this.emailid = emailid; }

    // Alias for JSON / backward compatibility
    public String getEmail() { return emailid; }
    public void setEmail(String email) { this.emailid = email; }

    public String getUserpassword() { return userpassword; }
    public void setUserpassword(String userpassword) { this.userpassword = userpassword; }

    // Alias for JSON / backward compatibility
    public String getPassword() { return userpassword; }
    public void setPassword(String password) { this.userpassword = password; }

    public Integer getRoleCode() { return role != null ? role : 1; }

    public String getRole() {
        if (role == null || role == 1) return "ADMIN";
        return String.valueOf(role);
    }

    public void setRole(Object roleInput) {
        if (roleInput == null) {
            this.role = 1;
            return;
        }
        if (roleInput instanceof Number) {
            this.role = ((Number) roleInput).intValue();
            return;
        }
        String str = roleInput.toString().trim();
        if ("1".equals(str) || "ADMIN".equalsIgnoreCase(str) || "ROOT".equalsIgnoreCase(str)) {
            this.role = 1;
        } else if ("2".equals(str) || "MANAGER".equalsIgnoreCase(str)) {
            this.role = 2;
        } else if ("3".equals(str) || "DEVELOPER".equalsIgnoreCase(str) || "ENGINEER".equalsIgnoreCase(str)) {
            this.role = 3;
        } else if ("4".equals(str) || "TESTER".equalsIgnoreCase(str) || "QA".equalsIgnoreCase(str)) {
            this.role = 4;
        } else {
            try {
                this.role = Integer.parseInt(str);
            } catch (Exception e) {
                this.role = 1;
            }
        }
    }

    public Integer getRootadmin() { return rootadmin; }
    public void setRootadmin(Integer rootadmin) { this.rootadmin = rootadmin; }

    public Integer getEnable() { return enable; }
    public void setEnable(Integer enable) { this.enable = enable; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Boolean getHasCompletedTour() { return hasCompletedTour; }
    public void setHasCompletedTour(Boolean hasCompletedTour) { this.hasCompletedTour = hasCompletedTour; }

    public String getManagerCode() { return managerCode; }
    public void setManagerCode(String managerCode) { this.managerCode = managerCode; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getCreatedDatetime() { return createdDatetime; }
    public void setCreatedDatetime(String createdDatetime) { this.createdDatetime = createdDatetime; }

    public String getModifiedDatetime() { return modifiedDatetime; }
    public void setModifiedDatetime(String modifiedDatetime) { this.modifiedDatetime = modifiedDatetime; }

    public String getPasswordHistory() { return passwordHistory; }
    public void setPasswordHistory(String passwordHistory) { this.passwordHistory = passwordHistory; }

    public UserMetrics getMetrics() { return metrics; }
    public void setMetrics(UserMetrics metrics) { this.metrics = metrics; }

    // Delegates for metrics (for Jackson JSON serialization / API backwards compatibility)
    public String getWorkload() { return metrics != null ? metrics.getWorkload() : "Balanced"; }
    public void setWorkload(String workload) { if (metrics == null) metrics = new UserMetrics(id); metrics.setWorkload(workload); }

    public Integer getAssignedTasksCount() { return metrics != null ? metrics.getAssignedTasksCount() : 0; }
    public void setAssignedTasksCount(Integer count) { if (metrics == null) metrics = new UserMetrics(id); metrics.setAssignedTasksCount(count); }

    public Integer getCompletedTasksCount() { return metrics != null ? metrics.getCompletedTasksCount() : 0; }
    public void setCompletedTasksCount(Integer count) { if (metrics == null) metrics = new UserMetrics(id); metrics.setCompletedTasksCount(count); }

    public Integer getPendingReviewsCount() { return metrics != null ? metrics.getPendingReviewsCount() : 0; }
    public void setPendingReviewsCount(Integer count) { if (metrics == null) metrics = new UserMetrics(id); metrics.setPendingReviewsCount(count); }

    public Double getLoggedHoursThisWeek() { return metrics != null ? metrics.getLoggedHoursThisWeek() : 0.0; }
    public void setLoggedHoursThisWeek(Double hours) { if (metrics == null) metrics = new UserMetrics(id); metrics.setLoggedHoursThisWeek(hours); }

    public Integer getOnTimeDeliveryRate() { return metrics != null ? metrics.getOnTimeDeliveryRate() : 100; }
    public void setOnTimeDeliveryRate(Integer rate) { if (metrics == null) metrics = new UserMetrics(id); metrics.setOnTimeDeliveryRate(rate); }

    public Integer getReopenedBugsCount() { return metrics != null ? metrics.getReopenedBugsCount() : 0; }
    public void setReopenedBugsCount(Integer count) { if (metrics == null) metrics = new UserMetrics(id); metrics.setReopenedBugsCount(count); }

    public Boolean getIsOnline() { return metrics != null ? metrics.getIsOnline() : false; }
    public void setIsOnline(Boolean isOnline) { if (metrics == null) metrics = new UserMetrics(id); metrics.setIsOnline(isOnline); }
}
