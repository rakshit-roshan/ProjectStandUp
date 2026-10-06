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
        String name = (String) body.get("roleName");
        String desc = (String) body.get("description");
        String permissionsJson = (String) body.get("permissionsJson");

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Role name is required.");
        }

        if (rolePermissionRepository.findByRoleName(name.trim()).isPresent()) {
            return ResponseEntity.badRequest().body("A role with this name already exists.");
        }

        // Generate next custom role code >= 5
        List<RolePermission> existing = rolePermissionRepository.findAll();
        int maxCode = existing.stream().mapToInt(RolePermission::getRoleCode).max().orElse(4);
        int nextCode = Math.max(5, maxCode + 1);

        String defaultPerms = permissionsJson != null ? permissionsJson : "[\"projects\",\"team_members\",\"chat\",\"tasks_kanban\",\"tasks_table\",\"issues\"]";

        RolePermission newRole = new RolePermission(
                nextCode,
                name.trim(),
                desc != null ? desc.trim() : "",
                defaultPerms,
                false
        );

        RolePermission saved = rolePermissionRepository.save(newRole);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{code}")
    public ResponseEntity<?> updateRole(@PathVariable Integer code, @RequestBody Map<String, Object> body) {
        Optional<RolePermission> roleOpt = rolePermissionRepository.findByRoleCode(code);
        if (roleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        RolePermission role = roleOpt.get();

        if (body.containsKey("roleName")) {
            String newName = (String) body.get("roleName");
            if (newName != null && !newName.trim().isEmpty()) {
                role.setRoleName(newName.trim());
            }
        }

        if (body.containsKey("description")) {
            role.setDescription((String) body.get("description"));
        }

        if (body.containsKey("permissionsJson")) {
            role.setPermissionsJson((String) body.get("permissionsJson"));
        }

        RolePermission saved = rolePermissionRepository.save(role);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<?> deleteRole(@PathVariable Integer code) {
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
    }
}
