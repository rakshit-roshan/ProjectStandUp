package com.standupflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tblRole_permissions")
public class RolePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_code", unique = true, nullable = false)
    private Integer roleCode;

    @Column(name = "role_name", nullable = false)
    private String roleName;

    private String description;

    @Column(name = "permissions_json", columnDefinition = "LONGTEXT")
    private String permissionsJson; // JSON array string of enabled menu keys

    @Column(name = "is_system")
    private Boolean isSystem = false;

    @Column(name = "created_datetime")
    private String createdDatetime = LocalDateTime.now().toString();

    public RolePermission() {}

    public RolePermission(Integer roleCode, String roleName, String description, String permissionsJson, Boolean isSystem) {
        this.roleCode = roleCode;
        this.roleName = roleName;
        this.description = description;
        this.permissionsJson = permissionsJson;
        this.isSystem = isSystem != null ? isSystem : false;
        this.createdDatetime = LocalDateTime.now().toString();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getRoleCode() { return roleCode; }
    public void setRoleCode(Integer roleCode) { this.roleCode = roleCode; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPermissionsJson() { return permissionsJson; }
    public void setPermissionsJson(String permissionsJson) { this.permissionsJson = permissionsJson; }

    public Boolean getIsSystem() { return isSystem; }
    public void setIsSystem(Boolean isSystem) { this.isSystem = isSystem; }

    public String getCreatedDatetime() { return createdDatetime; }
    public void setCreatedDatetime(String createdDatetime) { this.createdDatetime = createdDatetime; }
}
