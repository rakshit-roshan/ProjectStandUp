package com.standupflow.dto;

import com.standupflow.model.User;

public class AuthDTO {

    public static class LoginRequest {
        private String companyIdentifier; // Company ID or Admin Email
        private String username;          // User's Username
        private String password;          // User's Password
        private String email;             // Fallback/alias
        private String companyId;         // Fallback/alias

        public LoginRequest() {}

        public LoginRequest(String companyIdentifier, String username, String password) {
            this.companyIdentifier = companyIdentifier;
            this.username = username;
            this.password = password;
        }

        public String getCompanyIdentifier() {
            if (companyIdentifier != null && !companyIdentifier.trim().isEmpty()) {
                return companyIdentifier;
            }
            if (companyId != null && !companyId.trim().isEmpty()) {
                return companyId;
            }
            return email;
        }

        public void setCompanyIdentifier(String companyIdentifier) {
            this.companyIdentifier = companyIdentifier;
        }

        public String getUsername() {
            if (username != null && !username.trim().isEmpty()) {
                return username;
            }
            return email;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getEmailOrUsername() { return getUsername(); }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getCompanyId() { return companyId; }
        public void setCompanyId(String companyId) { this.companyId = companyId; }
    }

    public static class RegisterRequest {
        private String name;
        private String email;
        private String username;
        private String password;
        private String company; // Company Name
        private String role; // ROOT, ENGINEER, TESTER, MANAGER
        private String department;
        private String managerCode;

        public RegisterRequest() {}

        public RegisterRequest(String name, String email, String username, String password, String company, String role, String department, String managerCode) {
            this.name = name;
            this.email = email;
            this.username = username;
            this.password = password;
            this.company = company;
            this.role = role;
            this.department = department;
            this.managerCode = managerCode;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }

        public String getManagerCode() { return managerCode; }
        public void setManagerCode(String managerCode) { this.managerCode = managerCode; }
    }

    public static class AuthResponse {
        private boolean success;
        private String message;
        private User user;
        private String companyId;
        private String databaseName;

        public AuthResponse() {}

        public AuthResponse(boolean success, String message, User user) {
            this.success = success;
            this.message = message;
            this.user = user;
        }

        public AuthResponse(boolean success, String message, User user, String companyId, String databaseName) {
            this.success = success;
            this.message = message;
            this.user = user;
            this.companyId = companyId;
            this.databaseName = databaseName;
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public User getUser() { return user; }
        public void setUser(User user) { this.user = user; }

        public String getCompanyId() { return companyId; }
        public void setCompanyId(String companyId) { this.companyId = companyId; }

        public String getDatabaseName() { return databaseName; }
        public void setDatabaseName(String databaseName) { this.databaseName = databaseName; }
    }
}
