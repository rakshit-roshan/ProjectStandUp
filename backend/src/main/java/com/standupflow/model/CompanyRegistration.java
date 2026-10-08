package com.standupflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tblOrg_details")
public class CompanyRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", unique = true, nullable = false)
    private String companyId;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "full_name", nullable = false)
    private String rootUserName;

    @Column(name = "root_user_email", unique = true, nullable = false)
    private String rootUserEmail;

    @Column(name = "department")
    private String department;

    @Column(name = "role")
    private Integer role = 1; // 1 for Root Admin, 2 for Manager, 3 for Developer, 4 for Tester

    @Column(name = "created_datetime")
    private LocalDateTime createdDatetime = LocalDateTime.now();

    public CompanyRegistration() {}

    public CompanyRegistration(String companyId, String companyName, String rootUserName, String rootUserEmail, String department, Integer role) {
        this.companyId = companyId;
        this.companyName = companyName;
        this.rootUserName = rootUserName;
        this.rootUserEmail = rootUserEmail;
        this.department = department;
        this.role = role != null ? role : 1;
        this.createdDatetime = LocalDateTime.now();
    }

    public CompanyRegistration(String companyId, String companyName, String rootUserName, String rootUserEmail, String department, String roleStr) {
        this.companyId = companyId;
        this.companyName = companyName;
        this.rootUserName = rootUserName;
        this.rootUserEmail = rootUserEmail;
        this.department = department;
        setRole(roleStr);
        this.createdDatetime = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getDatabaseName() {
        return "standupflow_db_" + companyId;
    }

    public String getRootUserName() { return rootUserName; }
    public void setRootUserName(String rootUserName) { this.rootUserName = rootUserName; }

    public String getRootUserEmail() { return rootUserEmail; }
    public void setRootUserEmail(String rootUserEmail) { this.rootUserEmail = rootUserEmail; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

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
        } else {
            try { this.role = Integer.parseInt(str); } catch (Exception e) { this.role = 1; }
        }
    }

    public LocalDateTime getCreatedDatetime() { return createdDatetime; }
    public void setCreatedDatetime(LocalDateTime createdDatetime) { this.createdDatetime = createdDatetime; }
}
