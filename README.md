# StandupFlow — Agile Project & Team Performance Management Platform

StandupFlow is an enterprise-grade Agile Project Management & Developer Workspace platform built with Spring Boot 3 (Java 17) backend REST APIs and a React + Vite frontend. It streamlines sprint planning, task tracking, bug reporting, team chat messaging, and employee health analytics.

---

## Interactive Documentation Table of Contents

- [1. System Architecture & Tech Stack](#1-system-architecture--tech-stack)
- [2. User Roles & Access Control (RBAC)](#2-user-roles--access-control-rbac)
- [3. Comprehensive Module Guide & Feature Screenshots](#3-comprehensive-module-guide--feature-screenshots)
  - [3.1 Manager Dashboard](#31-manager-dashboard)
  - [3.2 Developer Workspace](#32-developer-workspace)
  - [3.3 Tester Workspace](#33-tester-workspace)
  - [3.4 Task & Backlog Management (Kanban, Table, Backlog)](#34-task--backlog-management-kanban-table-backlog)
  - [3.5 Sprint Planning & Execution](#35-sprint-planning--execution)
  - [3.6 Issue & Bug Tracking System](#36-issue--bug-tracking-system)
  - [3.7 Team Roster & Workspace Invites](#37-team-roster--workspace-invites)
  - [3.8 WhatsApp-Style Real-Time Team Chat](#38-whatsapp-style-real-time-team-chat)
  - [3.9 Health & Performance Analytics](#39-health--performance-analytics)
  - [3.10 Notifications & Settings](#310-notifications--settings)
- [4. Quick Start & Local Setup Guide](#4-quick-start--local-setup-guide)
- [5. API Endpoint Documentation](#5-api-endpoint-documentation)

---

## 1. System Architecture & Tech Stack

```mermaid
graph TD
    User([User Browser]) -->|React SPA| Frontend[Frontend: Vite + React 18 + Tailwind/CSS]
    Frontend -->|REST APIs / HTTP| Backend[Backend: Spring Boot 3 + Java 17]
    Backend -->|Spring Data JPA| DB[(MariaDB / H2 Database)]
    Frontend -->|Local Session Cache| LocalStorage[(Browser LocalStorage)]
```

* **Frontend**: React 18, Vite, Lucide React Icons, Custom Design Tokens, Context API (`AppContext.jsx`).
* **Backend**: Java 17, Spring Boot 3.x, Spring Data JPA, Hibernate, Jackson JSON, RESTful Controllers.
* **Database**: MariaDB / H2 Database with JPA ORM mapping.

---

## 2. User Roles & Access Control (RBAC)

| Role | Access Level | Primary Workspace & Capabilities |
| :--- | :--- | :--- |
| **MANAGER / ADMIN** | Full Administrative Control | Create projects/sprints, assign tasks, invite/remove members, view overall analytics, manage bug reports. |
| **DEVELOPER** | Execution & Development | View assigned tasks, track active work sessions, update task status, log code changes, team chat. |
| **TESTER / QA** | Quality Assurance & Testing | Dedicated testing queue, report bugs via `BugReportModal`, link issues to tasks, mark issue resolution. |

---

## 3. Comprehensive Module Guide & Feature Screenshots

### 3.1 Manager Dashboard
![Manager Dashboard View](docs/images/01_manager_dashboard.png)
* **What it does**: High-level overview of overall project velocity, sprint completion percentages, team workload indicators, overdue tasks, and recent activity logs.
* **How to Access**: Click Dashboard in the main left sidebar navigation when logged in as Manager.

---

### 3.2 Developer Workspace
![Developer Workspace View](docs/images/02_developer_workspace.png)
* **What it does**: Developer-focused workspace displaying assigned tasks, upcoming deadlines, completed story points, active work session timer, and status transitions.
* **How to Access**: Automatically opens upon login as Developer or select Developer Workspace from the workspace switcher.

---

### 3.3 Tester Workspace
![Tester Workspace View](docs/images/03_tester_workspace.png)
* **What it does**: QA workspace displaying open bug reports, test pass/fail breakdown, pending testing queue, and unresolved issue stats.
* **How to Access**: Automatically opens upon login as Tester or select Tester Workspace.

---

### 3.4 Task & Backlog Management (Kanban, Table, Backlog)

#### Kanban Board View
![Kanban Board View](docs/images/04_kanban_board.png)

#### Table View
![Table View](docs/images/05_table_view.png)

#### Backlog View
![Backlog View](docs/images/06_backlog_view.png)

* **What it does**: Full lifecycle management of tasks with story point allocation, priority tags, assignees, and sprint mapping.
  * **Kanban Board**: Status column view (Backlog, In Progress, In Review, Completed).
  * **Table View**: Compact list with column sorting, filters, and bulk status updates.
  * **Backlog View**: Unassigned or un-sprinted work items ready for planning.
* **How to Access**: Click Tasks in the left sidebar, then toggle between Kanban, Table, or Backlog tabs at the top.

---

### 3.5 Sprint Planning & Execution
![Sprint Management View](docs/images/07_sprint_management.png)
* **What it does**: Enables managers to create sprints with start/end dates, target goals, and total story points. Calculates real-time sprint completion percentages.
* **How to Access**: Click Sprints in the left sidebar to view active sprints, sprint metrics, or click Create Sprint.

---

### 3.6 Issue & Bug Tracking System
![Issue Tracking View](docs/images/08_issue_tracking.png)
* **What it does**: Comprehensive bug reporting tool with severity levels (Critical, High, Medium, Low), steps to reproduce, actual vs. expected results, environment details, and linked task associations.
* **How to Access**: Click Issues / Bugs in the left sidebar or click Report Bug in Tester Dashboard / Task Details Drawer.

---

### 3.7 Team Roster & Workspace Invites
![Team Members View](docs/images/09_team_members.png)
* **What it does**: Displays active project workspace assignees, invite code generator, email invitation system (`sendInvitation`), and member removal functionality for Managers.
* **How to Access**: Click Team Members in the left sidebar.

---

### 3.8 WhatsApp-Style Real-Time Team Chat
![Team Chat View](docs/images/10_team_chat.png)
* **What it does**: Real-time team messaging featuring 1-on-1 Direct Messages and Group Channels (`#general`, `#dev-team`). Supports file/photo attachments, unread message badges, and "Delete for Everyone" soft-delete placeholder (`You deleted this message` / `This message was deleted`).
* **How to Access**: Click Team Chat in the left sidebar navigation.

---

### 3.9 Health & Performance Analytics
![Health Analytics View](docs/images/11_health_analytics.png)
* **What it does**: Tracks developer burnout risk, workload distribution, project risk scores, performance reviews, and delivery rate metrics.
* **How to Access**: Click Health & Analytics in the left sidebar to toggle between Employee Health, Project Health, and Performance Reviews.

---

### 3.10 Notifications & Settings
![Settings View](docs/images/12_settings_view.png)
* **What it does**:
  * **Notifications**: Centralized feed for task assignments, issue updates, and project invitations.
  * **Settings**: Update profile info (name, department, avatar), manager invite code, dark/light theme options, and API endpoint config.
* **How to Access**: Click the Bell Icon (Notifications) or Settings gear icon in the top header / sidebar.

---

## 4. Quick Start & Local Setup Guide

### Prerequisites
* **Node.js** (v18+) & `npm`
* **Java Development Kit (JDK 17+)**
* **Maven** (or bundled `./mvnw`)

### 1. Run Backend (Spring Boot REST API)
```bash
cd backend
./mvnw spring-boot:run
```
*Backend runs on `http://localhost:8080/api/v1`*

### 2. Run Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend opens on `http://localhost:3001`*

---

## 5. API Endpoint Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate user credentials |
| `POST` | `/api/v1/auth/register` | Register new user with assigned role |
| `GET` | `/api/v1/tasks` | Fetch all project tasks |
| `POST` | `/api/v1/tasks` | Create new task item |
| `PUT` | `/api/v1/tasks/{id}` | Update task details or status |
| `DELETE` | `/api/v1/tasks/{id}` | Delete task by ID |
| `GET` | `/api/v1/chat/messages` | Fetch all chat messages |
| `POST` | `/api/v1/chat/messages` | Send new chat message |
| `DELETE` | `/api/v1/chat/messages/{id}` | Soft-delete chat message for everyone |
| `GET` | `/api/v1/chat/channels` | Fetch group channels |
| `POST` | `/api/v1/invitations/send` | Send project workspace invitation |
