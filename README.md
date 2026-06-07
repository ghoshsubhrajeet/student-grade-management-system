# PCC Student Grade Management System

A modern, full-stack student grade portal designed for Pasadena City College (PCC). The application features a secure, role-guarded RESTful backend built with **Spring Boot** and **Spring Security (JWT)**, paired with a premium, responsive **glassmorphic dark-themed React application**.

---

## 🌟 Key Features

*   **Role-Based Access Control (RBAC)**: Secure access tailored for three key roles:
    *   **Admin**: Full system management, user provisioning, student profile deletion, and modification of sensitive fields (e.g., Address, Phone Number).
    *   **Teacher**: Student performance viewing, grade updates, descriptive feedback entry, and CSV-based bulk grade importing. Sensitive fields are view-only.
    *   **Student**: Access to a personalized dashboard scorecard, listing grades, assignment scores, and direct feedback from teachers.
*   **Bulk CSV Ingestion**: Transactional import of student lists, courses, assignments, and grades with comprehensive diagnostic logs returned dynamically.
*   **Data Visualization**: Interactive, custom SVG-based bar charts computing class percentiles and score profiles.
*   **High Security & Integrity**:
    *   Stateless JWT authentication (tokens expire automatically and protect all `/api/**` endpoints).
    *   Strict database-level constraints and Hibernate/JPA validations.
    *   CORS handling for secure cross-origin communication.

---

## 🛠️ Technology Stack

### Backend
*   **Framework**: Java 17, Spring Boot 4.0.6
*   **Security**: Spring Security 6+ with Stateless JWT Auth (`jjwt-api` 0.12.3)
*   **Persistence**: Hibernate JPA with an in-memory H2 Database
*   **CSV Parsing**: Apache Commons CSV 1.10.0
*   **Utilities**: Lombok, Spring Boot Validation

### Frontend
*   **Build Tool**: Vite 8.0.12
*   **Framework**: React 19, React Router DOM 7
*   **Styling**: Custom Vanilla CSS (Dark glassmorphic theme, custom CSS variables, and transitions)
*   **Data Representation**: Custom SVG bar charts for grade visualization

---

## 🔑 Default Seeded Accounts

The application automatically seeds initial data on startup. You can log in with the following default credentials to experience the different access tiers:

| Username | Password | Role | Access Level / Key Features |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | **ADMIN** | User directory control, modify sensitive student address & phone, edit and delete records |
| `teacher` | `teacher123` | **TEACHER** | View students, manage grades & feedback, upload bulk CSVs (phone & address locked) |
| `student@pasadena.edu` | `student123` | **STUDENT** | View own profile details, interactive scorecard, individual assignment scores, and feedback |

---

## 🚀 How to Run Locally

### Prerequisites
*   **Java Development Kit (JDK) 17** or higher
*   **Node.js** (v18.x or higher) and **npm**

### Step 1: Clone and Start the Spring Boot Backend
1. Open a terminal in the root directory:
   ```bash
   ./mvnw spring-boot:run
   ```
2. The server will start up on **`http://localhost:8081`**.
3. You can access the in-memory database console at **`http://localhost:8081/h2-console`**:
   *   **JDBC URL**: `jdbc:h2:mem:grademanager`
   *   **Username**: `sa`
   *   **Password**: *(leave blank)*

### Step 2: Set Up and Start the React Frontend
1. Open a separate terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. The React application will start up on **`http://localhost:5173`**. Vite is configured to proxy all API requests from `http://localhost:5173/api` directly to `http://localhost:8081/api` automatically.

---

## 🔌 API Endpoints Reference

All requests to `/api/students/**`, `/api/grades/**`, and `/api/users/**` must include the `Authorization: Bearer <JWT_TOKEN>` header.

### Authentication
*   `POST /api/auth/login` - Public login endpoint. Returns user details, role, and a bearer JWT token.
*   `POST /api/auth/register` - **(Admin Only)** Register new backend accounts.

### Students
*   `GET /api/students` - List students (Admins/Teachers receive all; Students receive only their own profile).
*   `GET /api/students/{id}` - Fetch student profile by ID.
*   `POST /api/students` - **(Admin/Teacher Only)** Add a new student profile.
*   `PUT /api/students/{id}` - **(Admin/Teacher Only)** Update student details.
    *   *Note: Only Admins can modify sensitive fields (`address` and `phoneNumber`).*
*   `DELETE /api/students/{id}` - **(Admin Only)** Deletes a student profile.

### Grades
*   `GET /api/grades` - View grades (Admins/Teachers receive all; Students receive only their own grades).
*   `GET /api/grades/student/{studentId}` - **(Admin/Teacher Only)** View all grades for a specific student.
*   `PUT /api/grades/{id}` - **(Admin/Teacher Only)** Update grade scores and feedback.
*   `POST /api/grades/import` - **(Admin/Teacher Only)** Bulk import grades via a CSV file.

### Users (User Management)
*   `GET /api/users` - **(Admin Only)** View all registered user accounts.
*   `GET /api/users/{id}` - **(Admin Only)** View user details.
*   `PUT /api/users/{id}` - **(Admin Only)** Modify user details (roles, passwords).
*   `DELETE /api/users/{id}` - **(Admin Only)** Delete a user account.

---

## 📂 Project Structure

```
student-grade-management-system/
├── frontend/                     # React Single Page Application (Vite)
│   ├── src/
│   │   ├── components/           # Reusable UI widgets (Navbar, Sidebar, Charts, CSV uploaders)
│   │   ├── pages/                # Role-specific dashboard layouts and settings
│   │   └── services/api.js       # Fetch-based REST API client with JWT interceptor
│   └── package.json
├── src/                          # Spring Boot Java Application
│   ├── main/
│   │   ├── java/edu/pasadena/grademanager/
│   │   │   ├── config/           # Security & CORS configuration
│   │   │   ├── controller/       # REST API Controllers (RBAC-protected)
│   │   │   ├── model/            # JPA Entities (User, Student, Course, Assignment, Grade)
│   │   │   ├── repository/       # JPA Database Repository interfaces
│   │   │   ├── security/         # JWT filter, details providers, token utilities
│   │   │   ├── service/          # Business logic & CSV ingestion transaction handlers
│   │   │   └── util/             # DataSeeder startup utility
│   │   └── resources/
│   │       └── application.properties
│   └── test/                     # Unit and Integration test suite
├── pom.xml                       # Maven configuration and dependencies
└── README.md                     # Project documentation (this file)
```