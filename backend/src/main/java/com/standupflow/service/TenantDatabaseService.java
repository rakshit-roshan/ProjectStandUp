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

        // 3. Dynamically create physical database standupflow_db_<companyId> in MariaDB/MySQL
        createTenantDatabase(databaseName);

        // 4. Initialize all application table schemas inside the tenant database
        initializeTenantDatabaseTables(databaseName);

        // 5. Insert Admin User into tenant database's tblUser_details table
        insertRootUserIntoTenantDb(databaseName, rootUserId, rootName, rootEmail, password, department, companyId);

        return registration;
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
                    "lead VARCHAR(255), " +
                    "lead_id VARCHAR(255), " +
                    "color VARCHAR(50), " +
                    "invite_code VARCHAR(255), " +
                    "member_emails VARCHAR(2000), " +
                    "member_ids VARCHAR(2000)" +
                    ");");

            // Table: sprints
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS sprints (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "name VARCHAR(255), " +
                    "goal VARCHAR(1000), " +
                    "status VARCHAR(50), " +
                    "start_date VARCHAR(50), " +
                    "end_date VARCHAR(50), " +
                    "total_story_points INT, " +
                    "completed_story_points INT, " +
                    "project_id VARCHAR(255), " +
                    "task_ids VARCHAR(2000)" +
                    ");");

            // Table: tasks
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
                    "has_issue BOOLEAN" +
                    ");");

            // Table: issues
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS issues (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "title VARCHAR(255), " +
                    "description VARCHAR(2000), " +
                    "severity VARCHAR(50), " +
                    "status VARCHAR(50), " +
                    "reporter_id VARCHAR(255), " +
                    "reporter_name VARCHAR(255), " +
                    "assignee_id VARCHAR(255), " +
                    "assignee_name VARCHAR(255), " +
                    "task_id VARCHAR(255), " +
                    "task_title VARCHAR(255), " +
                    "steps_to_reproduce VARCHAR(2000), " +
                    "expected_result VARCHAR(1000), " +
                    "actual_result VARCHAR(1000), " +
                    "environment VARCHAR(255), " +
                    "created_at VARCHAR(50), " +
                    "resolved_at VARCHAR(50)" +
                    ");");

            // Table: chat_channels
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS chat_channels (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "name VARCHAR(255), " +
                    "topic VARCHAR(500), " +
                    "is_private BOOLEAN, " +
                    "member_ids VARCHAR(2000)" +
                    ");");

            // Table: chat_messages
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS chat_messages (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "sender_id VARCHAR(255), " +
                    "sender_name VARCHAR(255), " +
                    "sender_avatar LONGTEXT, " +
                    "content VARCHAR(4000), " +
                    "timestamp VARCHAR(50), " +
                    "channel_id VARCHAR(255), " +
                    "receiver_id VARCHAR(255), " +
                    "is_direct_message BOOLEAN, " +
                    "is_deleted BOOLEAN DEFAULT FALSE, " +
                    "attachment_url LONGTEXT, " +
                    "attachment_name VARCHAR(255), " +
                    "attachment_type VARCHAR(50)" +
                    ");");

            // Table: invitations
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS invitations (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "email VARCHAR(255), " +
                    "role VARCHAR(50), " +
                    "company_id VARCHAR(255), " +
                    "invite_code VARCHAR(255), " +
                    "status VARCHAR(50), " +
                    "invited_by VARCHAR(255), " +
                    "created_at VARCHAR(50)" +
                    ");");

            // Table: notifications
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS notifications (" +
                    "id VARCHAR(255) PRIMARY KEY, " +
                    "user_id VARCHAR(255), " +
                    "title VARCHAR(255), " +
                    "message VARCHAR(1000), " +
                    "type VARCHAR(50), " +
                    "read_status BOOLEAN DEFAULT FALSE, " +
                    "created_at VARCHAR(50), " +
                    "link VARCHAR(255)" +
                    ");");

            System.out.println("[TenantDatabaseService] Initialized tables for database: " + databaseName);
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
