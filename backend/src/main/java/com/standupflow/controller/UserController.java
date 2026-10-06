package com.standupflow.controller;

import com.standupflow.model.User;
import com.standupflow.model.UserMetrics;
import com.standupflow.repository.UserMetricsRepository;
import com.standupflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMetricsRepository userMetricsRepository;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Company Administrator User Creation Endpoint
    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name = body.get("name");
        String username = body.getOrDefault("username", name != null ? name.trim().toLowerCase().replaceAll("\\s+", "_") : "");
        String password = body.get("password");
        String role = body.getOrDefault("role", "DEVELOPER");
        String department = body.getOrDefault("department", "Engineering");
        String managerCode = body.get("managerCode");

        if (email == null || email.trim().isEmpty() || name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Name and Email are required fields.");
        }

        if ("root".equalsIgnoreCase(name.trim()) || "root".equalsIgnoreCase(username.trim()) || "root".equalsIgnoreCase(email.trim())) {
            return ResponseEntity.badRequest().body("Username 'root' is reserved for the primary Company Administrator.");
        }

        if (userRepository.findByEmailOrName(name.trim()).isPresent() || userRepository.findByEmail(email.trim()).isPresent()) {
            return ResponseEntity.badRequest().body("A user with this email or username already exists in this company workspace.");
        }

        String userId = "USR-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String userPass = (password != null && !password.trim().isEmpty()) ? password.trim() : "Password123!";
        
        String avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80";
        if ("TESTER".equalsIgnoreCase(role)) {
            avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80";
        } else if ("ADMIN".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role)) {
            avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80";
        }

        User newUser = new User(
                userId,
                username,
                name.trim(),
                email.trim(),
                userPass,
                role.toUpperCase(),
                0, // rootadmin = 0 for created users
                1, // enable = 1 (active by default)
                avatar,
                department,
                "Balanced",
                0, 0, 0, 0.0, 100, 0,
                true,
                managerCode != null ? managerCode.trim().toUpperCase() : null,
                false,
                null
        );

        User savedUser = userRepository.save(newUser);
        if (newUser.getMetrics() != null) {
            userMetricsRepository.save(newUser.getMetrics());
        }
        return ResponseEntity.ok(savedUser);
    }

    // Toggle Enable/Disable User Account Endpoint
    @PutMapping("/{id}/toggle-enable")
    public ResponseEntity<User> toggleEnableUser(@PathVariable String id, @RequestBody Map<String, Integer> body) {
        Integer enableStatus = body.getOrDefault("enable", 1);
        return userRepository.findById(id).map(user -> {
            user.setEnable(enableStatus);
            user.setModifiedDatetime(LocalDateTime.now().toString());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Profile Edit Endpoint
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUserProfile(@PathVariable String id, @RequestBody User profileData) {
        return userRepository.findById(id).map(user -> {
            if (profileData.getName() != null && !profileData.getName().trim().isEmpty()) {
                user.setName(profileData.getName());
            }
            if (profileData.getEmail() != null && !profileData.getEmail().trim().isEmpty()) {
                user.setEmail(profileData.getEmail());
            }
            if (profileData.getPassword() != null && !profileData.getPassword().trim().isEmpty()) {
                user.setPassword(profileData.getPassword());
            }
            if (profileData.getDepartment() != null) {
                user.setDepartment(profileData.getDepartment());
            }
            if (profileData.getAvatar() != null && !profileData.getAvatar().trim().isEmpty()) {
                user.setAvatar(profileData.getAvatar());
            }
            if (profileData.getRole() != null && !profileData.getRole().trim().isEmpty()) {
                user.setRole(profileData.getRole());
            }
            if (profileData.getEnable() != null) {
                user.setEnable(profileData.getEnable());
            }
            if (profileData.getManagerCode() != null) {
                user.setManagerCode(profileData.getManagerCode());
            }
            user.setModifiedDatetime(LocalDateTime.now().toString());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Developer / Tester Join Team Endpoint using Manager Code
    @PostMapping("/{id}/join-team")
    public ResponseEntity<User> joinTeam(@PathVariable String id, @RequestBody Map<String, String> body) {
        String code = body.get("managerCode");
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return userRepository.findById(id).map(user -> {
            user.setManagerCode(code.trim().toUpperCase());
            user.setModifiedDatetime(LocalDateTime.now().toString());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Manager Assign Member Endpoint by Email
    @PostMapping("/assign-member")
    public ResponseEntity<User> assignMemberByEmail(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String managerCode = body.get("managerCode");

        if (email == null || managerCode == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<User> memberOpt = userRepository.findByEmail(email.trim());
        if (memberOpt.isPresent()) {
            User member = memberOpt.get();
            member.setManagerCode(managerCode.trim().toUpperCase());
            member.setModifiedDatetime(LocalDateTime.now().toString());
            return ResponseEntity.ok(userRepository.save(member));
        }
        return ResponseEntity.notFound().build();
    }
}
