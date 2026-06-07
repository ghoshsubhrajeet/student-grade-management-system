# PCC Student Grade Portal - Frontend Implementation Walkthrough

We have successfully built and verified the React (Vite) + Vanilla CSS frontend inside a new [frontend/](file:///d:/Engineering/Programming/student-grade-management-system/frontend) subdirectory. The UI features a premium, responsive glassmorphic dark theme and handles role-based access control (RBAC) securely with JSON Web Tokens (JWT).

---

## What We Accomplished

### 1. Scaffolding & Setup
* **Vite Scaffolding**: Initialized React 18 under the new `/frontend` directory.
* **API Proxy**: Configured Vite proxy in [vite.config.js](file:///d:/Engineering/Programming/student-grade-management-system/frontend/vite.config.js) to route requests starting with `/api` directly to `http://localhost:8081`, bypassing CORS issues seamlessly in local development.
* **Dependency Assembly**: Installed `react-router-dom` for handling UI route state.

### 2. Styling & Theme System
* **Glassmorphic Design**: Developed a dark mode stylesheet in [index.css](file:///d:/Engineering/Programming/student-grade-management-system/frontend/src/index.css) utilizing custom CSS variables, backdrop blurs, transition curves, responsive grids, form components, custom scrollbars, and micro-hover states.
* **Font Styling**: Embedded the modern Google Font **Inter** as the default typography standard.
* **Conflict Prevention**: Cleared the default [App.css](file:///d:/Engineering/Programming/student-grade-management-system/frontend/src/App.css).

### 3. API Client Integration
* Created a lightweight `fetch`-based REST service in [api.js](file:///d:/Engineering/Programming/student-grade-management-system/frontend/src/services/api.js):
  * Manages login requests, token persistence, and logout cycles.
  * Intercepts and automatically appends `Authorization: Bearer <token>` header flags.
  * Checks for auth expiration status (automatically logging out users on 401/403 errors).
  * Exposes CRUD calls for students, grades, user credentials, and CSV uploading.

### 4. Components & Pages
* **Routing**: Configured app-level routing with custom `ProtectedRoute` role guards in [App.jsx](file:///d:/Engineering/Programming/student-grade-management-system/frontend/src/App.jsx).
* **Navbar & Sidebar**: Constructed [Navbar.jsx](file:///d:/Engineering/Programming/student-grade-management-system/frontend/src/components/Navbar.jsx) and [Sidebar.jsx](file:///d:/Engineering/Programming/student-grade-management-system/frontend/src/components/Sidebar.jsx) to show user profile details, dynamic links based on user role, and logout hooks.
* **Data Visualization**: Designed a custom SVG-based bar chart in [GradeChart.jsx](file:///d:/Engineering/Programming/student-grade-management-system/frontend/src/components/GradeChart.jsx) that calculates percentage scores dynamically.
* **Bulk Ingestion**: Built a file-drop uploader in [CsvImporter.jsx](file:///d:/Engineering/Programming/student-grade-management-system/frontend/src/components/CsvImporter.jsx) with a stylized log console rendering real-time parsing updates.
* **Login & Dashboard**: Created [Login.jsx](file:///d:/Engineering/Programming/student-grade-management-system/frontend/src/pages/Login.jsx) (including a password recovery instruction modal) and [Dashboard.jsx](file:///d:/Engineering/Programming/student-grade-management-system/frontend/src/pages/Dashboard.jsx) representing stats panels.
* **Admin & Teacher Panels**:
  * [StudentList.jsx](file:///d:/Engineering/Programming/student-grade-management-system/frontend/src/pages/StudentList.jsx): Student profiles, CRUD operations, with sensitive fields disabled for Teachers and fully enabled for Admins.
  * [GradeList.jsx](file:///d:/Engineering/Programming/student-grade-management-system/frontend/src/pages/GradeList.jsx): Full grades grid, assessment editing modal, CSV uploader integration, and a scorecard for Students.
  * [UserList.jsx](file:///d:/Engineering/Programming/student-grade-management-system/frontend/src/pages/UserList.jsx): User account management console.
  * [Unauthorized.jsx](file:///d:/Engineering/Programming/student-grade-management-system/frontend/src/pages/Unauthorized.jsx): Custom 403 access restricted message card.

### 5. SEO Enhancements
* Added a descriptive, high-quality title tag and a meta description to [index.html](file:///d:/Engineering/Programming/student-grade-management-system/frontend/index.html) to optimize searching and crawler compliance.

---

## Verification Results

We verified compiling success by running `npm run build` in the `frontend/` directory:
```bash
vite v8.0.16 building client environment for production...
transforming...✓ 35 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.65 kB │ gzip:  0.39 kB
dist/assets/index-ayBsL3zK.css    4.77 kB │ gzip:  1.66 kB
dist/assets/index-D1Q54TzW.js   285.88 kB │ gzip: 85.42 kB

✓ built in 278ms
```
The application compiles cleanly into production assets without any warnings or failures.

---

## How to Run & Test Locally

To run both backend and frontend applications side-by-side:

### Step 1: Start the Spring Boot Backend
From the root project directory:
```powershell
./mvnw spring-boot:run
```
*(The backend starts up on `http://localhost:8081`)*

### Step 2: Start the Vite Dev Server
In a new shell terminal, navigate to the `frontend/` subdirectory:
```powershell
cd frontend
npm run dev
```
*(The React frontend starts up on `http://localhost:5173`)*

### Step 3: Open in Browser and Authenticate
Open your web browser and navigate to `http://localhost:5173`. 
You can log in and explore different dashboards using the following default test accounts:

1. **Admin Login**:
   * **Username**: `admin`
   * **Password**: `admin123`
   * *Features*: Full dashboard, edit sensitive fields (phone/address), user manager.
2. **Teacher Login**:
   * **Username**: `teacher`
   * **Password**: `teacher123`
   * *Features*: Student list (sensitive phone/address fields locked), edit grades & feedback, upload CSV.
3. **Student Login**:
   * **Username**: `student@pasadena.edu`
   * **Password**: `student123`
   * *Features*: Scorecard containing individual grade percentages, assignments, and written feedback.
