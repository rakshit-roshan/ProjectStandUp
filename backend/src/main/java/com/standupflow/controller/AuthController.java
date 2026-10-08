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
        String companyIdentifier = request.getCompanyIdentifier() != null ? request.getCompanyIdentifier().trim() : "";
        String username = request.getUsername() != null ? request.getUsername().trim() : "";
        String password = request.getPassword() != null ? request.getPassword().trim() : "";

        if (companyIdentifier.isEmpty()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Company ID or Admin Email is required", null));
        }
        if (username.isEmpty()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Username is required", null));
        }
        if (password.isEmpty()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Password is required", null));
        }

        // 1. Check in master standupflow_db (tblOrg_details) via direct JDBC so thread dataSource context switches cleanly
        Optional<CompanyRegistration> regOpt = tenantDatabaseService.findCompanyRegistrationByIdOrEmail(companyIdentifier);

        if (regOpt.isEmpty()) {
            return ResponseEntity.status(401).body(new AuthResponse(false, "Company workspace or Admin Email '" + companyIdentifier + "' not found in system.", null));
        }

        CompanyRegistration reg = regOpt.get();
        String targetCompanyId = reg.getCompanyId();
        String targetDbName = reg.getDatabaseName();

        // 2. Set tenant context to standupflow_db_<companyId>
        TenantContext.setTenant(targetCompanyId, targetDbName);

        try {
            // 3. Query tblUser_details table in standupflow_db_<companyId> database
            Optional<User> userOpt = userRepository.findByUsernameOrEmailOrFullname(username);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByUsername(username);
            }
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByEmail(username);
            }
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByEmailOrName(username);
            }
            // Fallback for root admin logging in with admin email
            if (userOpt.isEmpty() && reg.getRootUserEmail() != null && reg.getRootUserEmail().equalsIgnoreCase(companyIdentifier)) {
                userOpt = userRepository.findById("1");
            }

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body(new AuthResponse(false, "User '" + username + "' does not exist in workspace database for Company ID '" + targetCompanyId + "'", null));
            }

            User user = userOpt.get();
            if (user.getEnable() != null && user.getEnable() == 0) {
                return ResponseEntity.status(401).body(new AuthResponse(false, "Your user account is temporarily disabled by the workspace Administrator.", null));
            }

            if (user.getPassword() != null && user.getPassword().equals(password)) {
                try {
                    user.setIsOnline(true);
                    user.setCompanyId(targetCompanyId);
                    userRepository.save(user);
                } catch (Exception e) {
                    System.err.println("[AuthController] Warning on updating user online status: " + e.getMessage());
                }
                return ResponseEntity.ok(new AuthResponse(true, "Login successful", user, targetCompanyId, targetDbName));
            } else {
                return ResponseEntity.status(401).body(new AuthResponse(false, "Invalid password for user '" + username + "'", null));
            }
        } finally {
            // Context clean-up managed per thread
        }
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
