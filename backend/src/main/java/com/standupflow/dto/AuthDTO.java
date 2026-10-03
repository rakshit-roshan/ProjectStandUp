package com.standupflow.dto;

import com.standupflow.model.User;

public class AuthDTO {

    public static class LoginRequest {
        private String email;
        private String password;

        public LoginRequest() {}

        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String company;
        private String role; // MANAGER, DEVELOPER, TESTER
        private String department;
        private String managerCode;

        public RegisterRequest() {}

        public RegisterRequest(String name, String email, String password, String company, String role, String department, String managerCode) {
            this.name = name;
            this.email = email;
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

        public AuthResponse() {}

        public AuthResponse(boolean success, String message, User user) {
            this.success = success;
            this.message = message;
            this.user = user;
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public User getUser() { return user; }
        public void setUser(User user) { this.user = user; }
    }
}
