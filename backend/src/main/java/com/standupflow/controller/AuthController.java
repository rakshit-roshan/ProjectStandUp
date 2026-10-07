package com.standupflow.controller;

import com.standupflow.config.TenantContext;
import com.standupflow.dto.AuthDTO.*;
import com.standupflow.model.CompanyRegistration;
import com.standupflow.model.User;
import com.standupflow.repository.CompanyRegistrationRepository;
import com.standupflow.repository.UserRepository;
import com.standupflow.service.TenantDatabaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private CompanyRegistrationRepository companyRegistrationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TenantDatabaseService tenantDatabaseService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        String rootEmail = request.getEmail() != null ? request.getEmail().trim() : "";

        if (rootEmail.isEmpty()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Email address is required", null));
        }

        // Check if email already registered in master tblOrg_details table
        Optional<CompanyRegistration> existingReg = companyRegistrationRepository.findByRootUserEmail(rootEmail);
        if (existingReg.isPresent()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Email address is already registered to another company workspace.", null));
        }

        try {
            String companyName = (request.getCompany() != null && !request.getCompany().trim().isEmpty()) 
                    ? request.getCompany().trim() : "My Enterprise Workspace";
            String rootName = request.getName() != null ? request.getName().trim() : "Root Administrator";
            String department = request.getDepartment() != null ? request.getDepartment().trim() : "Executive Board";

            // 1. Create company registration in tblOrg_details, dynamic database standupflow_db_<companyId>, tables, and root user
            CompanyRegistration reg = tenantDatabaseService.createNewCompanyRegistration(
                    companyName,
                    rootName,
                    rootEmail,
                    request.getPassword(),
                    department
            );

            // 2. Construct Admin User object matching tblUser_details schema
            String adminUserId = "1";
            User rootUser = new User(
                    adminUserId,
                    "root", // Fixed username for registrant
                    reg.getRootUserName(),
                    reg.getRootUserEmail(),
                    request.getPassword(),
                    1, // role = 1 (ADMIN / Root)
                    1, // rootadmin = 1
                    1, // enable = 1
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
                    reg.getDepartment(),
                    "Balanced", 0, 0, 0, 0.0, 100, 0, false, String.valueOf(ThreadLocalRandom.current().nextInt(100000, 999999)), true, reg.getCompanyId()
            );

            return ResponseEntity.ok(new AuthResponse(true, "Company workspace and database created successfully!", rootUser, reg.getCompanyId(), reg.getDatabaseName()));
        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Database creation error";
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Registration failed: " + errorMsg, null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail().trim() : "";
        if (identifier.isEmpty()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Email address or Username is required", null));
        }

        // 1. Search by Email in master tblOrg_details table
        Optional<CompanyRegistration> regOpt = companyRegistrationRepository.findByRootUserEmail(identifier);
        if (regOpt.isPresent()) {
            CompanyRegistration reg = regOpt.get();
            TenantContext.setTenant(reg.getCompanyId(), reg.getDatabaseName());

            Optional<User> userOpt = userRepository.findByEmailOrName(identifier);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getEnable() != null && user.getEnable() == 0) {
                    return ResponseEntity.status(401).body(new AuthResponse(false, "Your user account is temporarily disabled by the workspace Administrator.", null));
                }
                if (user.getPassword() != null && user.getPassword().equals(request.getPassword())) {
                    user.setIsOnline(true);
                    user.setCompanyId(reg.getCompanyId());
                    User savedUser = userRepository.save(user);
                    return ResponseEntity.ok(new AuthResponse(true, "Login successful", savedUser, reg.getCompanyId(), reg.getDatabaseName()));
                }
            }
        }

        // 2. If companyId provided in request or direct tenant lookup
        if (request.getCompanyId() != null && !request.getCompanyId().trim().isEmpty()) {
            Optional<CompanyRegistration> compOpt = companyRegistrationRepository.findByCompanyId(request.getCompanyId().trim());
            if (compOpt.isPresent()) {
                CompanyRegistration reg = compOpt.get();
                TenantContext.setTenant(reg.getCompanyId(), reg.getDatabaseName());

                Optional<User> userOpt = userRepository.findByEmailOrName(identifier);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    if (user.getEnable() != null && user.getEnable() == 0) {
                        return ResponseEntity.status(401).body(new AuthResponse(false, "Your user account is temporarily disabled by the workspace Administrator.", null));
                    }
                    if (user.getPassword() != null && user.getPassword().equals(request.getPassword())) {
                        user.setIsOnline(true);
                        user.setCompanyId(reg.getCompanyId());
                        User savedUser = userRepository.save(user);
                        return ResponseEntity.ok(new AuthResponse(true, "Login successful", savedUser, reg.getCompanyId(), reg.getDatabaseName()));
                    }
                }
            }
        }

        return ResponseEntity.status(401).body(new AuthResponse(false, "Invalid email/username or password", null));
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
