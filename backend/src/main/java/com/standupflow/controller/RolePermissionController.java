package com.standupflow.controller;

import com.standupflow.model.RolePermission;
import com.standupflow.repository.RolePermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/roles")
public class RolePermissionController {

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    @GetMapping
    public List<RolePermission> getAllRoles() {
        return rolePermissionRepository.findAll();
    }

    @GetMapping("/{code}")
    public ResponseEntity<RolePermission> getRoleByCode(@PathVariable Integer code) {
        return rolePermissionRepository.findByRoleCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createRole(@RequestBody Map<String, Object> body) {
        try {
            if (body == null) {
                return ResponseEntity.badRequest().body("Request body is required.");
            }

            Object nameObj = body.get("roleName");
            String name = nameObj != null ? String.valueOf(nameObj).trim() : "";
            if (name.isEmpty()) {
                return ResponseEntity.badRequest().body("Role name is required.");
            }

            Object descObj = body.get("description");
            String desc = descObj != null ? String.valueOf(descObj).trim() : "";

            Object permsObj = body.get("permissionsJson");
            String defaultPerms = "[\"dashboard\",\"projects\",\"team_members\",\"chat\",\"issues\",\"monitor\",\"employee_health\",\"tasks_kanban\",\"tasks_table\",\"sprints\",\"reports\",\"performance_review\",\"tester_workspace\",\"user_accounts\",\"user_roles\",\"settings\"]";
            String permissionsJson = defaultPerms;

            if (permsObj instanceof String && !((String) permsObj).trim().isEmpty()) {
                permissionsJson = ((String) permsObj).trim();
            } else if (permsObj != null) {
                permissionsJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(permsObj);
            }

            List<RolePermission> existing = rolePermissionRepository.findAll();
            for (RolePermission r : existing) {
                if (r.getRoleName() != null && r.getRoleName().equalsIgnoreCase(name)) {
                    return ResponseEntity.badRequest().body("A role with name '" + name + "' already exists.");
                }
            }

            // Generate next custom role code >= 5
            int maxCode = existing.stream()
                    .mapToInt(r -> r.getRoleCode() != null ? r.getRoleCode() : 0)
                    .max()
                    .orElse(4);
            int nextCode = Math.max(5, maxCode + 1);

            RolePermission newRole = new RolePermission(
                    nextCode,
                    name,
                    desc,
                    permissionsJson,
                    false
            );

            RolePermission saved = rolePermissionRepository.save(newRole);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to create role: " + e.getMessage());
        }
    }

    @PutMapping("/{code}")
    public ResponseEntity<?> updateRole(@PathVariable Integer code, @RequestBody Map<String, Object> body) {
        try {
            Optional<RolePermission> roleOpt = rolePermissionRepository.findByRoleCode(code);
            if (roleOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            RolePermission role = roleOpt.get();

            if (body != null) {
                if (body.containsKey("roleName")) {
                    Object nameObj = body.get("roleName");
                    String newName = nameObj != null ? String.valueOf(nameObj).trim() : "";
                    if (!newName.isEmpty()) {
                        List<RolePermission> existing = rolePermissionRepository.findAll();
                        for (RolePermission r : existing) {
                            if (r.getRoleName() != null && r.getRoleName().equalsIgnoreCase(newName) && !code.equals(r.getRoleCode())) {
                                return ResponseEntity.badRequest().body("A role with name '" + newName + "' already exists.");
                            }
                        }
                        role.setRoleName(newName);
                    }
                }

                if (body.containsKey("description")) {
                    Object descObj = body.get("description");
                    role.setDescription(descObj != null ? String.valueOf(descObj).trim() : "");
                }

                if (body.containsKey("permissionsJson")) {
                    Object permsObj = body.get("permissionsJson");
                    if (permsObj instanceof String) {
                        role.setPermissionsJson((String) permsObj);
                    } else if (permsObj != null) {
                        role.setPermissionsJson(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(permsObj));
                    }
                }
            }

            RolePermission saved = rolePermissionRepository.save(role);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to update role: " + e.getMessage());
        }
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<?> deleteRole(@PathVariable Integer code) {
        try {
            Optional<RolePermission> roleOpt = rolePermissionRepository.findByRoleCode(code);
            if (roleOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            RolePermission role = roleOpt.get();
            if (Boolean.TRUE.equals(role.getIsSystem()) || code <= 4) {
                return ResponseEntity.badRequest().body("System default roles cannot be deleted.");
            }

            rolePermissionRepository.delete(role);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to delete role: " + e.getMessage());
        }
    }
}
