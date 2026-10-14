# StandupFlow: Complete Beginner's Learning & Real-Time Debugging Guide
> **Audience:** Absolute beginners in Spring Boot and React  
> **Repository:** `ProjectStandUp` (`f:\ProjectStandUp`)  
> **Goal:** Teach you how the system works from the very first step, how to trace data end-to-end, how to debug in real-time (starting with Login), and how to immediately identify which file to edit for any feature or bug fix.

---

## Table of Contents
1. [The 30,000-Foot Architecture: How Frontend & Backend Talk](#1-the-30000-foot-architecture)
2. [Where Login Credentials Live in This Project](#2-where-login-credentials-live-in-this-project)
3. [Real-Time Debugging Walkthrough: Clicking "Sign In"](#3-real-time-debugging-walkthrough-clicking-sign-in)
   - [Phase A: Frontend Debugging (Browser DevTools)](#phase-a-frontend-debugging-browser-devtools)
   - [Phase B: The Wire (Network Tab & HTTP Request)](#phase-b-the-wire-network-tab--http-request)
   - [Phase C: Backend Debugging (Spring Boot & Breakpoints)](#phase-c-backend-debugging-spring-boot--breakpoints)
   - [Phase D: Database Execution (SQL & Context)](#phase-d-database-execution-sql--context)
4. [Learning Spring Boot Through This Project](#4-learning-spring-boot-through-this-project)
5. [Learning React Through This Project](#5-learning-react-through-this-project)
6. [The "Where Do I Change Code?" Master Matrix](#6-the-where-do-i-change-code-master-matrix)
7. [How to Fix Bugs Like a Senior Engineer: 4-Step Strategy](#7-how-to-fix-bugs-like-a-senior-engineer)
8. [Hands-On Practice Exercises for Day 1](#8-hands-on-practice-exercises-for-day-1)

---

## 1. The 30,000-Foot Architecture

In `ProjectStandUp`, your application is divided into two independent running applications that communicate over HTTP:

```
+-------------------------------------------------------------+
|                      USER'S BROWSER                         |
|  React (Vite) App running at: http://localhost:5173         |
|  - Renders UI buttons, inputs, tables, boards               |
|  - Manages component state (useState, useContext)           |
+-------------------------------------------------------------+
                           |
            HTTP Requests  |  JSON Data
     (POST, GET, PUT, etc) |  (e.g. { "username": "root" })
                           v
+-------------------------------------------------------------+
|                   SPRING BOOT BACKEND                       |
|  Java Application running at: http://localhost:8080/api/v1  |
|  - Listens on REST Endpoints (@RestController)              |
|  - Validates credentials & applies business logic           |
|  - Coordinates Multi-Tenant Database connections            |
+-------------------------------------------------------------+
                           |
              JDBC / SQL   |  Query Results
                           v
+-------------------------------------------------------------+
|                    MARIADB DATABASE                         |
|  Master Database: standupflow_db (tblOrg_details)           |
|  Tenant Databases: standupflow_db_<companyId> (tblUser_...) |
+-------------------------------------------------------------+
```

### Folder Map
- [`frontend/`](file:///f:/ProjectStandUp/frontend): User interface written in React + JavaScript + Vite + Tailwind CSS.
- [`backend/`](file:///f:/ProjectStandUp/backend): Business logic and APIs written in Java + Spring Boot + Maven + Spring Data JPA.
- [`config.ini`](file:///f:/ProjectStandUp/config.ini): Central environment config for DB credentials, ports, and hostnames.
- [`start.bat`](file:///f:/ProjectStandUp/start.bat): Launch script that runs config synchronization, builds both apps, and starts both servers.

---

## 2. Where Login Credentials Live in This Project

In `ProjectStandUp`, authentication requires **3 fields**:
1. **Company ID or Admin Email** (`companyIdentifier`)
2. **Username or Email** (`username`)
3. **Password** (`password`)

### Where are they stored?
1. **In MariaDB (Real Multi-Tenant Database)**:
   - When a company registers, a record is created in master database `standupflow_db` inside table `tblOrg_details`.
     - `company_id`: e.g., `ORG-1001` or auto-generated code.
     - `root_user_email`: e.g., `admin@company.com`.
   - A dedicated workspace database is dynamically created: `standupflow_db_<companyId>` (e.g. `standupflow_db_1001`).
   - The user account is saved in `standupflow_db_<companyId>` inside table `tblUser_details`:
     - Default root username: `root`
     - Password: The password chosen during registration.
2. **In Frontend Fallback Mock Data**:
   - If the backend is not connected or fails, the frontend has built-in mock users defined in [`frontend/src/data/mockData.js`](file:///f:/ProjectStandUp/frontend/src/data/mockData.js):
     - Username: `admin` | Password: `password123` (Role: ADMIN)
     - Username: `alex` | Password: `password123` (Role: DEVELOPER)
     - Username: `sarah` | Password: `password123` (Role: TESTER)

---

## 3. Real-Time Debugging Walkthrough: Clicking "Sign In"

Let's follow the data packet as you type your credentials and click the **"Sign in"** button.

### Phase A: Frontend Debugging (Browser DevTools)

1. **The Component**: Open [`frontend/src/components/auth/LoginPage.jsx`](file:///f:/ProjectStandUp/frontend/src/components/auth/LoginPage.jsx).
   - In `LoginPage.jsx`, three states hold your input:
     ```javascript
     const [companyIdentifier, setCompanyIdentifier] = useState('');
     const [username, setUsername] = useState('');
     const [password, setPassword] = useState('');
     ```
   - When you click the submit button, form triggers `handleSubmit`:
     ```javascript
     const handleSubmit = async (e) => {
       e.preventDefault();
       setLoading(true);
       await login(companyIdentifier, username, password); // Calls AppContext
       setLoading(false);
     };
     ```

2. **How to Pause & Debug in Browser**:
   - Open your browser to `http://localhost:5173`.
   - Press **`F12`** (or right-click anywhere on the page and select **Inspect**).
   - Go to the **Sources** tab (or **Debugger** in Firefox).
   - Press `Ctrl + P` and type `LoginPage.jsx`.
   - Click line number 26 (`handleSubmit`) to set a **blue breakpoint marker**.
   - Alternatively, you can add `debugger;` directly into the code:
     ```javascript
     const handleSubmit = async (e) => {
       e.preventDefault();
       debugger; // <-- Execution will immediately freeze here in DevTools!
       setLoading(true);
       await login(companyIdentifier, username, password);
       setLoading(false);
     };
     ```
   - Now click **Sign in** on the web page:
     - The page will freeze!
     - In the right-hand **Scope** panel, you will see the exact values of `companyIdentifier`, `username`, and `password`.
     - Hover over any variable with your mouse to view its value.
     - Press **`F10`** (Step Over) to run line-by-line, or **`F11`** (Step Into) to step inside the `login` function in `AppContext.jsx`.

---

### Phase B: The Wire (Network Tab & HTTP Request)

When `login` in [`frontend/src/context/AppContext.jsx`](file:///f:/ProjectStandUp/frontend/src/context/AppContext.jsx#L423-L474) executes:

```javascript
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ companyIdentifier, username, password })
});
```

1. **How to inspect the HTTP call in DevTools**:
   - In DevTools, click the **Network** tab.
   - Filter by **`Fetch/XHR`** (top filter bar).
   - Click **Sign in** on the page.
   - You will see a row appear: `login`. Click it!
2. **What to inspect**:
   - **Headers**:
     - *Request URL*: `http://localhost:8080/api/v1/auth/login`
     - *Request Method*: `POST`
     - *Status Code*: `200 OK` (Success) or `401 Unauthorized` / `400 Bad Request` / `500 Server Error`.
   - **Payload**:
     - Click **Payload** tab to verify what data the frontend transmitted:
       ```json
       {
         "companyIdentifier": "ORG-1001",
         "username": "root",
         "password": "mypassword"
       }
       ```
   - **Response**:
     - Click **Response** tab to see what Spring Boot sent back:
       ```json
       {
         "success": true,
         "message": "Login successful",
         "user": { "id": "1", "username": "root", "role": "ADMIN", ... },
         "companyId": "ORG-1001",
         "databaseName": "standupflow_db_1001"
       }
       ```

---

### Phase C: Backend Debugging (Spring Boot & Breakpoints)

Now the HTTP packet hits the Spring Boot backend.

1. **The Controller Entry Point**:
   Open [`backend/src/main/java/com/standupflow/controller/AuthController.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/controller/AuthController.java#L86-L150).
   ```java
   @PostMapping("/login")
   public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
       String companyIdentifier = request.getCompanyIdentifier();
       String username = request.getUsername();
       String password = request.getPassword();
       ...
   ```
2. **Setting a Backend Breakpoint**:
   - In your IDE (IntelliJ IDEA, VS Code with Java extension, or Eclipse):
     - Find `AuthController.java`.
     - Click on the left margin beside line 88 (inside `public ResponseEntity<AuthResponse> login(...)`). A red dot appears.
     - **Important:** Make sure you start the backend using **Debug Mode** (click the little "Bug" icon next to `StandupFlowApplication.java`, not the plain "Play" icon).
   - In your browser, click **Sign In**.
   - Your IDE will immediately jump to the front and freeze execution on line 88!
3. **What to inspect in IDE Debugger**:
   - **Variables Window**:
     - Expand `request`: verify `request.getCompanyIdentifier()`, `request.getUsername()`, `request.getPassword()`.
   - **Step Over (`F8` in IntelliJ / `F10` in VS Code)**:
     - Watch line 103 execute:
       ```java
       Optional<CompanyRegistration> regOpt = tenantDatabaseService.findCompanyRegistrationByIdOrEmail(companyIdentifier);
       ```
     - Did `regOpt.isEmpty()` evaluate to `true`? If yes, it means the company ID or admin email doesn't exist in master `tblOrg_details`!
     - Watch line 114 execute:
       ```java
       TenantContext.setTenant(targetCompanyId, targetDbName);
       ```
       This dynamically points the database connection to the company's workspace DB!
     - Watch line 118 execute:
       ```java
       Optional<User> userOpt = userRepository.findByUsernameOrEmailid(username, username);
       ```
     - Did `userOpt.isEmpty()` evaluate to `true`? If yes, the user doesn't exist in that workspace database.
     - Watch line 129 execute:
       ```java
       if (user.getPassword() != null && user.getPassword().equals(password))
       ```
       Here you can see the stored password versus the entered password.

---

### Phase D: Database Execution (SQL & Context)

In `ProjectStandUp`, SQL logging is enabled in [`backend/src/main/resources/application.properties`](file:///f:/ProjectStandUp/backend/src/main/resources/application.properties):
```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

Look at the terminal running the backend. Whenever you click login or create a task, you will see the exact SQL queries printed in real-time:
```sql
Hibernate: 
    select
        u1_0.userid,
        u1_0.username,
        u1_0.password,
        u1_0.emailid,
        u1_0.role
    from
        tblUser_details u1_0 
    where
        u1_0.username=? 
        or u1_0.emailid=?
```

---

## 4. Learning Spring Boot Through This Project

Spring Boot follows the **Layered (3-Tier) Architecture Pattern**. Here is how it maps in this repository:

```
[HTTP Request from React]
         │
         ▼
1. CONTROLLER (@RestController)  ──> Example: TaskController.java
   - Handles HTTP verbs (GET, POST, PUT, DELETE)
   - Validates input format
         │
         ▼
2. SERVICE (@Service)            ──> Example: TenantDatabaseService.java
   - Business calculations, validation rules, multi-tenancy switches
         │
         ▼
3. REPOSITORY (@Repository)      ──> Example: TaskRepository.java
   - Extends JpaRepository<Task, String>
   - Executes SQL queries without writing manual SQL
         │
         ▼
4. MODEL / ENTITY (@Entity)      ──> Example: Task.java
   - Java class mapped directly to database table (e.g. tblTask_details)
```

### Key Spring Boot Annotations Used in this Project:
| Annotation | What it means | Where to look |
|---|---|---|
| `@RestController` | Marks class as an API controller returning JSON. | [`TaskController.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/controller/TaskController.java) |
| `@RequestMapping("/api/v1/...")` | Base URL path for all endpoints in the controller. | [`AuthController.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/controller/AuthController.java) |
| `@GetMapping`, `@PostMapping` | Maps HTTP GET or POST request to a Java method. | Throughout all controllers |
| `@PathVariable` | Extracts parameter from URL (e.g. `/tasks/{id}`). | [`TaskController.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/controller/TaskController.java) |
| `@RequestBody` | Automatically parses incoming JSON into a Java Object. | `login(@RequestBody LoginRequest req)` |
| `@Autowired` | Spring automatically injects the instance of a service or repository. | Everywhere |
| `@Entity` & `@Table` | Maps a Java class to a MariaDB table. | [`Task.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/model/Task.java) |

---

## 5. Learning React Through This Project

React builds the UI using modular, reusable components and reactive state.

### 1. State (`useState`)
Stores data that belongs to a component. Whenever state changes, the component automatically re-renders.
Example in [`LoginPage.jsx`](file:///f:/ProjectStandUp/frontend/src/components/auth/LoginPage.jsx):
```javascript
const [username, setUsername] = useState('');
// When user types, setUsername updates the value and re-renders the input
```

### 2. Global State (`useContext` via `AppContext.jsx`)
Instead of passing data through 10 layers of components, [`AppContext.jsx`](file:///f:/ProjectStandUp/frontend/src/context/AppContext.jsx) stores the entire application state globally:
- `currentUser`: The logged-in user object.
- `currentRole`: `ADMIN`, `ENGINEER`, `TESTER`.
- `currentView`: Which screen is active (`dashboard`, `tasks_kanban`, `issues`, etc.).
- `tasks`, `sprints`, `issues`: Cached lists of records fetched from backend.

Any component accesses global state in 1 line:
```javascript
import { useApp } from '../../context/AppContext';
const { tasks, currentUser, navigateTo } = useApp();
```

### 3. Screen Switching (`App.jsx`)
In [`App.jsx`](file:///f:/ProjectStandUp/frontend/src/App.jsx#L53-L105), notice how view routing works:
```javascript
const renderView = () => {
  switch (currentView) {
    case 'dashboard': return <ManagerDashboard />;
    case 'tasks_kanban': return <KanbanView />;
    case 'issues': return <IssuesTableView />;
    case 'settings': return <SettingsView />;
    ...
  }
};
```
When you call `navigateTo('tasks_kanban')`, `currentView` changes, and React switches the component rendered on screen!

---

## 6. The "Where Do I Change Code?" Master Matrix

Use this lookup table whenever you need to add a feature or fix a bug in a specific module:

| Module / Feature | What you see on screen | Frontend Files (React) | Backend Files (Spring Boot) | Database Table |
|---|---|---|---|---|
| **Authentication** | Login screen, Register screen, Join organization | [`LoginPage.jsx`](file:///f:/ProjectStandUp/frontend/src/components/auth/LoginPage.jsx)<br>[`RegisterPage.jsx`](file:///f:/ProjectStandUp/frontend/src/components/auth/RegisterPage.jsx) | [`AuthController.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/controller/AuthController.java) | `tblOrg_details`<br>`tblUser_details` |
| **Tasks & Kanban** | Drag-and-drop board, Task table, Task details drawer | [`KanbanView.jsx`](file:///f:/ProjectStandUp/frontend/src/components/tasks/KanbanView.jsx)<br>[`TableView.jsx`](file:///f:/ProjectStandUp/frontend/src/components/tasks/TableView.jsx)<br>[`TaskDetailsDrawer.jsx`](file:///f:/ProjectStandUp/frontend/src/components/tasks/TaskDetailsDrawer.jsx)<br>[`CreateTaskModal.jsx`](file:///f:/ProjectStandUp/frontend/src/components/modals/CreateTaskModal.jsx) | [`TaskController.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/controller/TaskController.java)<br>[`Task.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/model/Task.java)<br>[`TaskRepository.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/repository/TaskRepository.java) | `tblTask_details` |
| **Sprints** | Active Sprint, Burndown chart, Sprint planning | [`SprintDetailsView.jsx`](file:///f:/ProjectStandUp/frontend/src/components/sprints/SprintDetailsView.jsx)<br>[`CreateSprintModal.jsx`](file:///f:/ProjectStandUp/frontend/src/components/modals/CreateSprintModal.jsx) | [`SprintController.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/controller/SprintController.java)<br>[`Sprint.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/model/Sprint.java) | `tblSprint_details` |
| **QA Bugs & Issues** | Issue tracker, Bug reports, Severity badges, Step repro | [`IssuesTableView.jsx`](file:///f:/ProjectStandUp/frontend/src/components/issues/IssuesTableView.jsx)<br>[`IssueDetailsDrawer.jsx`](file:///f:/ProjectStandUp/frontend/src/components/issues/IssueDetailsDrawer.jsx)<br>[`BugReportModal.jsx`](file:///f:/ProjectStandUp/frontend/src/components/testing/BugReportModal.jsx) | [`IssueController.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/controller/IssueController.java)<br>[`Issue.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/model/Issue.java) | `tblIssue_details` |
| **Dashboards** | Manager KPI metrics, Velocity cards, Health overview | [`ManagerDashboard.jsx`](file:///f:/ProjectStandUp/frontend/src/components/dashboard/ManagerDashboard.jsx)<br>[`DeveloperDashboard.jsx`](file:///f:/ProjectStandUp/frontend/src/components/dashboard/DeveloperDashboard.jsx)<br>[`TesterDashboard.jsx`](file:///f:/ProjectStandUp/frontend/src/components/dashboard/TesterDashboard.jsx) | Fetches from `TaskController.java`, `SprintController.java`, `IssueController.java` | Aggregates all tables |
| **Team Chat** | Direct messages, channels, real-time messaging | [`TeamChatView.jsx`](file:///f:/ProjectStandUp/frontend/src/components/chat/TeamChatView.jsx) | [`ChatController.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/controller/ChatController.java)<br>[`ChatMessage.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/model/ChatMessage.java) | `tblChat_messages`<br>`tblChat_channels` |
| **Team & Users** | User list, Assignee avatars, Online indicators | [`TeamMembersView.jsx`](file:///f:/ProjectStandUp/frontend/src/components/team/TeamMembersView.jsx)<br>[`UserAccountsView.jsx`](file:///f:/ProjectStandUp/frontend/src/components/admin/UserAccountsView.jsx) | [`UserController.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/controller/UserController.java)<br>[`User.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/model/User.java) | `tblUser_details` |
| **Roles & Permissions** | Access control matrix, Permission toggles | [`UserRolesView.jsx`](file:///f:/ProjectStandUp/frontend/src/components/admin/UserRolesView.jsx) | [`RolePermissionController.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/controller/RolePermissionController.java) | `tblRole_permissions` |
| **Top Bar & Navigation** | Navigation icons, User dropdown, Organization switcher | [`Header.jsx`](file:///f:/ProjectStandUp/frontend/src/components/layout/Header.jsx)<br>[`Sidebar.jsx`](file:///f:/ProjectStandUp/frontend/src/components/layout/Sidebar.jsx) | Uses context session info from `AppContext.jsx` | N/A |

---

## 7. How to Fix Bugs Like a Senior Engineer

Whenever you encounter a bug, follow this exact 4-step checklist:

### Step 1: Find the Visual Element (Grep Search)
- Look at the text on the screen (e.g. a button that says *"Create Sprint"* or a label *"Story Points"*).
- In your editor/IDE, search for that exact text string in `frontend/src`.
- This immediately brings you to the exact `.jsx` file that renders it!

### Step 2: Track the Action to `AppContext.jsx`
- In that component, find the `onClick` or `onSubmit` handler (e.g., `createTask(...)` or `updateStatus(...)`).
- Open [`frontend/src/context/AppContext.jsx`](file:///f:/ProjectStandUp/frontend/src/context/AppContext.jsx) and find where that function is implemented.
- Check the `fetch(`${API_BASE_URL}/...`)` line. Note the HTTP URL (e.g. `/api/v1/tasks`).

### Step 3: Match the URL to the Backend Controller
- In `backend/src/main/java/com/standupflow/controller`, open the matching Controller (e.g., [`TaskController.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/controller/TaskController.java)).
- Find the method with `@PostMapping`, `@GetMapping`, or `@PutMapping` that matches the URL.
- This is where the backend receives the request.

### Step 4: Check Logs & DevTools
- If the bug is frontend: check browser **Console** (`F12 -> Console`) for red JavaScript errors.
- If the bug is backend: check the backend terminal for Java stack traces (exceptions) or check the MariaDB SQL output.

---

## 8. Hands-On Practice Exercises for Day 1

Try these 3 quick exercises to cement your understanding:

### Exercise 1: Add a Live Debug Log in Frontend
1. Open [`frontend/src/components/auth/LoginPage.jsx`](file:///f:/ProjectStandUp/frontend/src/components/auth/LoginPage.jsx).
2. Inside `handleSubmit` (around line 25), add:
   ```javascript
   console.log('DEBUG: Submitting login for company:', companyIdentifier, 'user:', username);
   ```
3. Save the file. Vite hot-reloads instantly.
4. In browser DevTools Console, click Login and see your message appear in real-time!

### Exercise 2: Add a Backend Print Statement
1. Open [`backend/src/main/java/com/standupflow/controller/AuthController.java`](file:///f:/ProjectStandUp/backend/src/main/java/com/standupflow/controller/AuthController.java).
2. Inside `login` method (around line 90), add:
   ```java
   System.out.println(">>> [DEBUG BACKEND] Login attempt for user: " + username + " in org: " + companyIdentifier);
   ```
3. Restart or recompile backend (`mvn compile`).
4. Attempt a login in browser. Watch your backend terminal print the message live!

### Exercise 3: Inspect a Network Request
1. Open DevTools `Network` tab.
2. Click on the Kanban board or Task table.
3. Observe the `GET /api/v1/tasks` network call, inspect its response JSON, and compare it with the tasks displayed on the board.
