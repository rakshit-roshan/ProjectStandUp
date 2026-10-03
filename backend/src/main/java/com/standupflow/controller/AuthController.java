package com.standupflow.controller;

import com.standupflow.dto.AuthDTO.*;
import com.standupflow.model.User;
import com.standupflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword() != null && user.getPassword().equals(request.getPassword())) {
                user.setIsOnline(true);
                User savedUser = userRepository.save(user);
                return ResponseEntity.ok(new AuthResponse(true, "Login successful", savedUser));
            }
        }
        return ResponseEntity.status(401).body(new AuthResponse(false, "Invalid email or password", null));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Email address already registered", null));
        }

        String userId = "USR-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String reqRole = request.getRole() != null ? request.getRole().toUpperCase() : "ENGINEER";
        String userRole = ("MANAGER".equals(reqRole) || "DEVELOPER".equals(reqRole)) ? "ENGINEER" : reqRole;

        // Unique Lead / Team Hash Code assignment for Engineers or join code for Team Members
        String teamManagerCode = null;
        if ("ENGINEER".equalsIgnoreCase(userRole)) {
            teamManagerCode = "LEAD-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        } else if (request.getManagerCode() != null && !request.getManagerCode().trim().isEmpty()) {
            teamManagerCode = request.getManagerCode().trim().toUpperCase();
        }

        String avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80";
        if ("TESTER".equalsIgnoreCase(userRole)) {
            avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80";
        }

        User newUser = new User(
                userId,
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                userRole,
                avatar,
                request.getDepartment() != null ? request.getDepartment() : "Engineering",
                "Balanced",
                0, 0, 0, 0.0, 100, 0,
                false, // hasCompletedTour is false for new users
                teamManagerCode,
                true // isOnline is true for new logged-in user
        );

        User savedUser = userRepository.save(newUser);
        return ResponseEntity.ok(new AuthResponse(true, "Registration successful", savedUser));
    }

    @PostMapping("/logout/{userId}")
    public ResponseEntity<Void> logout(@PathVariable String userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setIsOnline(false);
            userRepository.save(user);
        });
        return ResponseEntity.ok().build();
    }

    @PostMapping("/complete-tour/{userId}")
    public ResponseEntity<User> completeTour(@PathVariable String userId) {
        return userRepository.findById(userId).map(user -> {
            user.setHasCompletedTour(true);
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }
}
