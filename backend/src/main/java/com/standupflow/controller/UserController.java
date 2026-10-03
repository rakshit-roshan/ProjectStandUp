package com.standupflow.controller;

import com.standupflow.model.User;
import com.standupflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

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
            if (profileData.getManagerCode() != null) {
                user.setManagerCode(profileData.getManagerCode());
            }
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
            return ResponseEntity.ok(userRepository.save(member));
        }
        return ResponseEntity.notFound().build();
    }
}
