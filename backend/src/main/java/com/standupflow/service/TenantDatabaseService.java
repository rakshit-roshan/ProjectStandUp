package com.standupflow.service;

import com.standupflow.model.CompanyRegistration;
import com.standupflow.model.User;
import com.standupflow.repository.CompanyRegistrationRepository;
import com.standupflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class TenantDatabaseService {

    @Autowired
    private CompanyRegistrationRepository companyRegistrationRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${spring.datasource.username:root}")
    private String dbUsername;

    @Value("${spring.datasource.password:escan_123456}")
    private String dbPassword;

    @Value("${spring.datasource.url:jdbc:mariadb://localhost:3306/standupflow_db}")
    private String masterDbUrl;

    static {
        try {
            Class.forName("org.mariadb.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("[TenantDatabaseService] MariaDB Driver not found: " + e.getMessage());
        }
    }

    public Optional<CompanyRegistration> findCompanyRegistrationByIdOrEmail(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) return Optional.empty();
        String cleanInput = identifier.trim().replace("'", "''");
        ensureMasterTableExists();
        try (Connection conn = getDirectConnection("standupflow_db");
             Statement stmt = conn.createStatement();
             java.sql.ResultSet rs = stmt.executeQuery(
                     "SELECT company_id, company_name, full_name, root_user_email, department, role FROM tblOrg_details WHERE company_id = '" + cleanInput + "' OR root_user_email = '" + cleanInput + "' LIMIT 1"
             )) {
            if (rs.next()) {
                CompanyRegistration reg = new CompanyRegistration(
                        rs.getString("company_id"),
                        rs.getString("company_name"),
                        rs.getString("full_name"),
                        rs.getString("root_user_email"),
                        rs.getString("department"),
                        rs.getInt("role")
                );
                return Optional.of(reg);
            }
        } catch (Exception e) {
            System.err.println("[TenantDatabaseService] Direct JDBC lookup note: " + e.getMessage());
        }
        return companyRegistrationRepository.findByCompanyId(cleanInput).or(() -> companyRegistrationRepository.findByRootUserEmail(cleanInput));
    }

    public CompanyRegistration createNewCompanyRegistration(String companyName, String rootName, String rootEmail, String password, String department) throws Exception {
        // 0. Ensure master database (standupflow_db) contains tblOrg_details
        ensureMasterTableExists();

        // 1. Generate unique random numeric companyId (e.g., 84920153)
        long numericCompanyId = ThreadLocalRandom.current().nextLong(10000000L, 99999999L);
        String companyId = String.valueOf(numericCompanyId);
        String databaseName = "standupflow_db_" + companyId;

        // Primary root admin user ID starts at 1
        String rootUserId = "1";

        CompanyRegistration registration = new CompanyRegistration(
                companyId,
                companyName,
                rootName,
                rootEmail,
                department,
                "ADMIN"
        );

        // 2. Insert into Master Registration Table (tblOrg_details) via direct JDBC
        insertMasterRegistrationIntoDb(registration);

        try {
            // 3. Dynamically create physical database standupflow_db_<companyId> in MariaDB/MySQL
            createTenantDatabase(databaseName);

            // 4. Initialize all application table schemas inside the tenant database
            initializeTenantDatabaseTables(databaseName);

            // 5. Insert Admin User into tenant database's tblUser_details table
            insertRootUserIntoTenantDb(databaseName, rootUserId, rootName, rootEmail, password, department, companyId);

            return registration;
        } catch (Exception e) {
            // Roll back orphaned master registration and partial database on any error
            rollbackFailedRegistration(companyId, databaseName);
            throw e;
        }
    }

    private void rollbackFailedRegistration(String companyId, String databaseName) {
        try (Connection conn = getDirectConnection("standupflow_db");
             Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("DELETE FROM tblOrg_details WHERE company_id = '" + companyId.replace("'", "''") + "'");
            stmt.executeUpdate("DROP DATABASE IF EXISTS `" + databaseName + "`");
            System.out.println("[TenantDatabaseService] Rolled back failed registration for companyId: " + companyId);
        } catch (Exception ex) {
            System.err.println("[TenantDatabaseService] Rollback note: " + ex.getMessage());
        }
    }

    private void insertMasterRegistrationIntoDb(CompanyRegistration reg) throws Exception {
        ensureMasterTableExists();
        try (Connection conn = getDirectConnection("standupflow_db");
             Statement stmt = conn.createStatement()) {
            String sql = String.format(
                    "INSERT INTO tblOrg_details (company_id, company_name, full_name, root_user_email, department, role, created_datetime) " +
                    "VALUES ('%s', '%s', '%s', '%s', '%s', %d, NOW());",
                    reg.getCompanyId(),
                    reg.getCompanyName().replace("'", "''"),
                    reg.getRootUserName().replace("'", "''"),
                    reg.getRootUserEmail().replace("'", "''"),
                    reg.getDepartment() != null ? reg.getDepartment().replace("'", "''") : "",
                    reg.getRoleCode()
            );
            stmt.executeUpdate(sql);
            System.out.println("[TenantDatabaseService] Inserted registration into standupflow_db.tblOrg_details");
        } catch (Exception e) {
            System.err.println("[TenantDatabaseService] Error inserting into tblOrg_details via JDBC: " + e.getMessage());
            try {
                companyRegistrationRepository.save(reg);
            } catch (Exception ex) {
                throw new Exception("Failed to record company registration: " + ex.getMessage());
            }
        }
    }

    private String getBaseJdbcUrl() {
        int slashIdx = masterDbUrl.lastIndexOf("/");
        if (slashIdx > 0) {
            String base = masterDbUrl.substring(0, slashIdx + 1);
            if (base.contains("?")) {
                base = base.substring(0, base.indexOf("?"));
            }
            return base;
        }
        return "jdbc:mariadb://localhost:3306/";
    }

    private Connection getDirectConnection(String dbName) throws Exception {
        Class.forName("org.mariadb.jdbc.Driver");
        String baseUrl = getBaseJdbcUrl();
        String url = baseUrl + (dbName != null ? dbName : "") + "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true";
        return DriverManager.getConnection(url, dbUsername, dbPassword);
    }

    public void ensureMasterTableExists() {
        try {
            Class.forName("org.mariadb.jdbc.Driver");
            String baseUrl = getBaseJdbcUrl();
            String url = baseUrl + "standupflow_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true";
            try (Connection conn = DriverManager.getConnection(url, dbUsername, dbPassword);
                 Statement stmt = conn.createStatement()) {
                stmt.executeUpdate("CREATE TABLE IF NOT EXISTS tblOrg_details (" +
                        "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                        "company_id VARCHAR(255) UNIQUE NOT NULL, " +
                        "company_name VARCHAR(255) NOT NULL, " +
                        "full_name VARCHAR(255) NOT NULL, " +
                        "root_user_email VARCHAR(255) UNIQUE NOT NULL, " +
                        "department VARCHAR(255), " +
                        "role INT DEFAULT 1, " +
                        "created_datetime DATETIME" +
                        ");");

                System.out.println("[TenantDatabaseService] Verified master database (standupflow_db) table (tblOrg_details).");
            }
        } catch (Exception e) {
            System.err.println("[TenantDatabaseService] Master table initialization note: " + e.getMessage());
        }
    }

    public void createTenantDatabase(String databaseName) throws Exception {
        Class.forName("org.mariadb.jdbc.Driver");
        String baseUrl = getBaseJdbcUrl();
        String url = baseUrl + "?useSSL=false&allowPublicKeyRetrieval=true";
        try (Connection conn = DriverManager.getConnection(url, dbUsername, dbPassword);
             Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("CREATE DATABASE IF NOT EXISTS `" + databaseName + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
            System.out.println("[TenantDatabaseService] Created database: " + databaseName);
        }
    }

    public boolean doesTenantDatabaseExist(String databaseName) {
        if (databaseName == null || databaseName.trim().isEmpty()) return false;
        try {
            Class.forName("org.mariadb.jdbc.Driver");
            String baseUrl = getBaseJdbcUrl();
            String url = baseUrl + "?useSSL=false&allowPublicKeyRetrieval=true";
            try (Connection conn = DriverManager.getConnection(url, dbUsername, dbPassword);
                 Statement stmt = conn.createStatement();
                 java.sql.ResultSet rs = stmt.executeQuery("SHOW DATABASES LIKE '" + databaseName.replace("'", "''") + "'")) {
                return rs.next();
            }
        } catch (Exception e) {
            return false;
        }
    }

    public void initializeTenantDatabaseTables(String databaseName) throws Exception {
        try (Connection conn = getDirectConnection(databaseName);
             Statement stmt = conn.createStatement()) {

            // Table: tblUser_details (Identity & Authentication)
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS tblUser_details (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "username VARCHAR(255) UNIQUE NOT NULL, " +
                    "fullname VARCHAR(255) NOT NULL, " +
                    "emailid VARCHAR(255) UNIQUE NOT NULL, " +
                    "userpassword VARCHAR(255) NOT NULL, " +
                    "role INT DEFAULT 1, " +
                    "rootadmin INT DEFAULT 0, " +
                    "enable INT DEFAULT 1, " +
                    "avatar LONGTEXT, " +
                    "department VARCHAR(255), " +
                    "has_completed_tour BOOLEAN DEFAULT FALSE, " +
                    "manager_code VARCHAR(255), " +
                    "company_id VARCHAR(255), " +
                    "created_datetime VARCHAR(100), " +
                    "modified_datetime VARCHAR(100), " +
                    "password_history LONGTEXT" +
                    ");");

            // Table: tblUser_metrics (Dashboard Metrics & Workload)
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS tblUser_metrics (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "user_id VARCHAR(255) UNIQUE NOT NULL, " +
                    "workload VARCHAR(50) DEFAULT 'Balanced', " +
                    "assigned_tasks_count INT DEFAULT 0, " +
                    "completed_tasks_count INT DEFAULT 0, " +
                    "pending_reviews_count INT DEFAULT 0, " +
                    "logged_hours_this_week DOUBLE DEFAULT 0.0, " +
                    "on_time_delivery_rate INT DEFAULT 100, " +
                    "reopened_bugs_count INT DEFAULT 0, " +
                    "is_online BOOLEAN DEFAULT FALSE, " +
                    "modified_datetime VARCHAR(100)" +
                    ");");

            // Clean up legacy duplicate table if present
            try {
                stmt.executeUpdate("DROP TABLE IF EXISTS tbl_role_permissions;");
            } catch (Exception ignored) {}

            // Table: tblRole_permissions (Role-Based Access Control)
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS tblRole_permissions (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "role_code INT UNIQUE NOT NULL, " +
                    "role_name VARCHAR(100) NOT NULL, " +
                    "description VARCHAR(255), " +
                    "permissions_json LONGTEXT, " +
                    "is_system BOOLEAN DEFAULT FALSE, " +
                    "created_datetime VARCHAR(100)" +
                    ");");

            // Seed default system role (Company Administrator only) if not present
            String seedTenantRoles = " (1, 'Company Administrator', 'Primary organization administrator with full governance access.', '[\"dashboard\",\"projects\",\"team_members\",\"chat\",\"tasks_kanban\",\"tasks_table\",\"issues\",\"monitor\",\"employee_health\",\"sprints\",\"reports\",\"performance_review\",\"tester_workspace\",\"user_accounts\",\"user_roles\",\"settings\"]', true, NOW());";

            stmt.executeUpdate("INSERT IGNORE INTO tblRole_permissions (role_code, role_name, description, permissions_json, is_system, created_datetime) VALUES" + seedTenantRoles);

            // Clean up default roles 2, 3, 4 from tblRole_permissions except Company Administrator (role_code 1)
            try {
                stmt.executeUpdate("DELETE FROM tblRole_permissions WHERE role_code IN (2, 3, 4);");
            } catch (Exception ignored) {}

            // Table: projects
            // Table: projects
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS projects (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "name VARCHAR(255), " +
                    "code VARCHAR(50), " +
                    "description VARCHAR(1000), " +
                    "status VARCHAR(50), " +
                    "sprint_completion INT, " +
                    "total_tasks INT, " +
                    "completed_tasks INT, " +
                    "open_issues INT, " +
                    "overdue_tasks INT, " +
                    "`lead` VARCHAR(255), " +
                    "lead_id VARCHAR(255), " +
                    "color VARCHAR(50), " +
                    "invite_code VARCHAR(255), " +
                    "member_emails VARCHAR(2000), " +
                    "member_ids VARCHAR(2000)" +
                    ");");

            // Table: sprints (matches Sprint.java)
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS sprints (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "name VARCHAR(255), " +
                    "project_id VARCHAR(255), " +
                    "project_name VARCHAR(255), " +
                    "goal VARCHAR(1000), " +
                    "start_date VARCHAR(50), " +
                    "end_date VARCHAR(50), " +
                    "status VARCHAR(50), " +
                    "total_tasks INT, " +
                    "completed_tasks INT, " +
                    "story_points INT, " +
                    "completed_story_points INT" +
                    ");");

            // Table: tasks (matches TaskItem.java)
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS tasks (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "title VARCHAR(255), " +
                    "description VARCHAR(2000), " +
                    "status VARCHAR(50), " +
                    "priority VARCHAR(50), " +
                    "assignee_id VARCHAR(255), " +
                    "assignee_name VARCHAR(255), " +
                    "assignee_avatar LONGTEXT, " +
                    "reporter_id VARCHAR(255), " +
                    "reporter_name VARCHAR(255), " +
                    "sprint_id VARCHAR(255), " +
                    "sprint_name VARCHAR(255), " +
                    "project_id VARCHAR(255), " +
                    "project_name VARCHAR(255), " +
                    "story_points INT, " +
                    "start_date VARCHAR(50), " +
                    "due_date VARCHAR(50), " +
                    "updated_at VARCHAR(50), " +
                    "testing_status VARCHAR(50), " +
                    "tester_id VARCHAR(255), " +
                    "tester_name VARCHAR(255), " +
                    "has_issue BOOLEAN, " +
                    "attachments_json LONGTEXT, " +
                    "subtasks_json LONGTEXT" +
                    ");");

            // Table: issues (matches IssueItem.java)
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS issues (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "title VARCHAR(255), " +
                    "description VARCHAR(2000), " +
                    "state VARCHAR(50), " +
                    "priority VARCHAR(50), " +
                    "severity VARCHAR(50), " +
                    "assignee_id VARCHAR(255), " +
                    "assignee_name VARCHAR(255), " +
                    "assignee_avatar LONGTEXT, " +
                    "reporter_id VARCHAR(255), " +
                    "reporter_name VARCHAR(255), " +
                    "module VARCHAR(255), " +
                    "project_id VARCHAR(255), " +
                    "project_name VARCHAR(255), " +
                    "linked_task_id VARCHAR(255), " +
                    "linked_task_title VARCHAR(255), " +
                    "start_date VARCHAR(50), " +
                    "due_date VARCHAR(50), " +
                    "end_date VARCHAR(50), " +
                    "steps_to_reproduce VARCHAR(2000), " +
                    "expected_result VARCHAR(1000), " +
                    "actual_result VARCHAR(1000), " +
                    "environment VARCHAR(255)" +
                    ");");

            // Table: chat_channels (matches ChatChannel.java)
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS chat_channels (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "name VARCHAR(255), " +
                    "type VARCHAR(50), " +
                    "description VARCHAR(1000), " +
                    "member_ids VARCHAR(2000), " +
                    "created_by VARCHAR(255), " +
                    "created_at VARCHAR(100)" +
                    ");");

            // Table: chat_messages (matches ChatMessage.java)
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS chat_messages (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "sender_id VARCHAR(255), " +
                    "sender_name VARCHAR(255), " +
                    "sender_avatar LONGTEXT, " +
                    "recipient_id VARCHAR(255), " +
                    "channel_id VARCHAR(255), " +
                    "content VARCHAR(4000), " +
                    "attachments_json LONGTEXT, " +
                    "timestamp VARCHAR(50), " +
                    "reactions_json LONGTEXT, " +
                    "is_read BOOLEAN DEFAULT FALSE, " +
                    "is_deleted BOOLEAN DEFAULT FALSE" +
                    ");");

            // Table: invitations (matches Invitation.java)
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS invitations (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "manager_id VARCHAR(255), " +
                    "manager_name VARCHAR(255), " +
                    "manager_code VARCHAR(255), " +
                    "project_id VARCHAR(255), " +
                    "invitee_email VARCHAR(255) NOT NULL, " +
                    "status VARCHAR(50), " +
                    "created_at DATETIME" +
                    ");");

            // Table: notifications (matches Notification.java)
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS notifications (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "user_id VARCHAR(255), " +
                    "user_email VARCHAR(255), " +
                    "title VARCHAR(255), " +
                    "message VARCHAR(1000), " +
                    "reporter_name VARCHAR(255), " +
                    "link_task_id VARCHAR(255), " +
                    "is_read BOOLEAN DEFAULT FALSE, " +
                    "timestamp VARCHAR(50)" +
                    ");");

            // Table: requirements (matches Requirement.java)
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS requirements (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "title VARCHAR(255), " +
                    "description VARCHAR(4000), " +
                    "priority VARCHAR(50), " +
                    "category VARCHAR(100), " +
                    "project_id VARCHAR(255), " +
                    "project_name VARCHAR(255), " +
                    "sprint_id VARCHAR(255), " +
                    "sprint_name VARCHAR(255), " +
                    "assignee_id VARCHAR(255), " +
                    "assignee_name VARCHAR(255), " +
                    "assignee_avatar LONGTEXT, " +
                    "status VARCHAR(50), " +
                    "converted_task_id VARCHAR(255), " +
                    "created_by_user_id VARCHAR(255), " +
                    "created_by_name VARCHAR(255), " +
                    "created_by_avatar LONGTEXT, " +
                    "attachments_json LONGTEXT, " +
                    "created_at VARCHAR(100), " +
                    "updated_at VARCHAR(100)" +
                    ");");

            // Ensure schema alignment for any existing tables with ALTER TABLE ADD COLUMN IF NOT EXISTS
            alignExistingTenantTableSchemas(stmt);

            System.out.println("[TenantDatabaseService] Initialized tables for database: " + databaseName);
        }
    }

    private void alignExistingTenantTableSchemas(Statement stmt) {
        String[] alterStatements = new String[] {
            // Projects
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS member_emails VARCHAR(2000);",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS member_ids VARCHAR(2000);",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS `lead` VARCHAR(255);",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS lead_id VARCHAR(255);",
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS invite_code VARCHAR(255);",
            // Sprints
            "ALTER TABLE sprints ADD COLUMN IF NOT EXISTS project_id VARCHAR(255);",
            "ALTER TABLE sprints ADD COLUMN IF NOT EXISTS project_name VARCHAR(255);",
            "ALTER TABLE sprints ADD COLUMN IF NOT EXISTS total_tasks INT;",
            "ALTER TABLE sprints ADD COLUMN IF NOT EXISTS completed_tasks INT;",
            "ALTER TABLE sprints ADD COLUMN IF NOT EXISTS story_points INT;",
            "ALTER TABLE sprints ADD COLUMN IF NOT EXISTS completed_story_points INT;",
            // Tasks
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id VARCHAR(255);",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_name VARCHAR(255);",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sprint_id VARCHAR(255);",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sprint_name VARCHAR(255);",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reporter_id VARCHAR(255);",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reporter_name VARCHAR(255);",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_avatar LONGTEXT;",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS story_points INT;",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date VARCHAR(50);",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date VARCHAR(50);",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at VARCHAR(50);",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS testing_status VARCHAR(50);",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tester_id VARCHAR(255);",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tester_name VARCHAR(255);",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS has_issue BOOLEAN;",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS attachments_json LONGTEXT;",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subtasks_json LONGTEXT;",
            // Issues
            "ALTER TABLE issues ADD COLUMN IF NOT EXISTS state VARCHAR(50);",
            "ALTER TABLE issues ADD COLUMN IF NOT EXISTS priority VARCHAR(50);",
            "ALTER TABLE issues ADD COLUMN IF NOT EXISTS severity VARCHAR(50);",
            "ALTER TABLE issues ADD COLUMN IF NOT EXISTS assignee_avatar LONGTEXT;",
            "ALTER TABLE issues ADD COLUMN IF NOT EXISTS module VARCHAR(255);",
            "ALTER TABLE issues ADD COLUMN IF NOT EXISTS project_id VARCHAR(255);",
            "ALTER TABLE issues ADD COLUMN IF NOT EXISTS project_name VARCHAR(255);",
            "ALTER TABLE issues ADD COLUMN IF NOT EXISTS linked_task_id VARCHAR(255);",
            "ALTER TABLE issues ADD COLUMN IF NOT EXISTS linked_task_title VARCHAR(255);",
            "ALTER TABLE issues ADD COLUMN IF NOT EXISTS start_date VARCHAR(50);",
            "ALTER TABLE issues ADD COLUMN IF NOT EXISTS due_date VARCHAR(50);",
            "ALTER TABLE issues ADD COLUMN IF NOT EXISTS end_date VARCHAR(50);",
            // Invitations
            "ALTER TABLE invitations ADD COLUMN IF NOT EXISTS manager_id VARCHAR(255);",
            "ALTER TABLE invitations ADD COLUMN IF NOT EXISTS manager_name VARCHAR(255);",
            "ALTER TABLE invitations ADD COLUMN IF NOT EXISTS manager_code VARCHAR(255);",
            "ALTER TABLE invitations ADD COLUMN IF NOT EXISTS project_id VARCHAR(255);",
            "ALTER TABLE invitations ADD COLUMN IF NOT EXISTS invitee_email VARCHAR(255);",
            // Notifications
            "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);",
            "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS reporter_name VARCHAR(255);",
            "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link_task_id VARCHAR(255);",
            "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS timestamp VARCHAR(50);",
            // Chat Messages
            "ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS recipient_id VARCHAR(255);",
            "ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS channel_id VARCHAR(255);",
            "ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS attachments_json LONGTEXT;",
            "ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reactions_json LONGTEXT;",
            "ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;",
            // Chat Channels
            "ALTER TABLE chat_channels ADD COLUMN IF NOT EXISTS type VARCHAR(50);",
            "ALTER TABLE chat_channels ADD COLUMN IF NOT EXISTS description VARCHAR(1000);",
            "ALTER TABLE chat_channels ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);",
            "ALTER TABLE chat_channels ADD COLUMN IF NOT EXISTS created_at VARCHAR(100);",
            // Requirements
            "ALTER TABLE requirements ADD COLUMN IF NOT EXISTS attachments_json LONGTEXT;"
        };

        for (String sql : alterStatements) {
            try {
                stmt.executeUpdate(sql);
            } catch (Exception ignored) {}
        }
    }

    public void alignAllTenantTableSchemas(String databaseName) {
        if (databaseName == null || databaseName.trim().isEmpty() || "standupflow_db".equalsIgnoreCase(databaseName)) return;
        try (Connection conn = getDirectConnection(databaseName);
             Statement stmt = conn.createStatement()) {
            initializeTenantDatabaseTables(databaseName);
        } catch (Exception e) {
            System.err.println("[TenantDatabaseService] Error aligning schema for " + databaseName + ": " + e.getMessage());
        }
    }

    private void insertRootUserIntoTenantDb(String databaseName, String rootUserId, String rootName, String rootEmail, String password, String department, String companyId) throws Exception {
        String avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80";
        String managerCode = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 999999));
        String nowStr = LocalDateTime.now().toString();

        String usernameVal = "root";
        try (Connection conn = getDirectConnection(databaseName);
             Statement stmt = conn.createStatement()) {
            String sqlUser = String.format(
                    "INSERT INTO tblUser_details (id, username, fullname, emailid, userpassword, role, rootadmin, enable, avatar, department, has_completed_tour, manager_code, company_id, created_datetime, modified_datetime, password_history) " +
                    "VALUES ('%s', '%s', '%s', '%s', '%s', 1, 1, 1, '%s', '%s', false, '%s', '%s', '%s', '%s', '');",
                    rootUserId, usernameVal, rootName.replace("'", "''"), rootEmail.replace("'", "''"), password.replace("'", "''"), avatar, department.replace("'", "''"), managerCode, companyId, nowStr, nowStr
            );
            stmt.executeUpdate(sqlUser);

            String sqlMetrics = String.format(
                    "INSERT INTO tblUser_metrics (user_id, workload, assigned_tasks_count, completed_tasks_count, pending_reviews_count, logged_hours_this_week, on_time_delivery_rate, reopened_bugs_count, is_online, modified_datetime) " +
                    "VALUES ('%s', 'Balanced', 0, 0, 0, 0.0, 100, 0, true, '%s');",
                    rootUserId, nowStr
            );
            stmt.executeUpdate(sqlMetrics);
            System.out.println("[TenantDatabaseService] Inserted Admin User into " + databaseName + ".tblUser_details and tblUser_metrics");
        }
    }
}
