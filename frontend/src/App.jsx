import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './services/api';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import GradeList from './pages/GradeList';
import UserList from './pages/UserList';
import Unauthorized from './pages/Unauthorized';
import ChangePassword from './pages/ChangePassword';

// Helper component for protecting routes by login state and user role
function ProtectedRoute({ children, allowedRoles }) {
  const user = api.getCurrentUser();
  const token = localStorage.getItem('token');

  // If not authenticated, redirect to login page
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and user's role is not included, redirect to unauthorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Helper component to redirect already authenticated users away from login
function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Dashboard Overview */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Protected Student Profiles Management */}
        <Route 
          path="/students" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
              <StudentList />
            </ProtectedRoute>
          } 
        />

        {/* Protected Grades Control Page */}
        <Route 
          path="/grades" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT']}>
              <GradeList />
            </ProtectedRoute>
          } 
        />

        {/* Protected User Accounts Console */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserList />
            </ProtectedRoute>
          } 
        />

        {/* Protected Change Password */}
        <Route 
          path="/change-password" 
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } 
        />

        {/* Redirections */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
