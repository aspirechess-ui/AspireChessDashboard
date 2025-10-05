import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Auth Pages
import { Login, SignUp, ForgotPassword } from "./pages/auth";

// Common Pages
import NotFound from "./pages/common/NotFound";
import Unauthorized from "./pages/common/Unauthorized";
import LoadingSpinner from "./components/LoadingSpinner";
import DashboardLayout from "./layouts/DashboardLayout";

// Admin Pages
import {
  AdminDashboard,
  ManageUsers,
  ManageBatches,
  AdminSettings,
  AdminAnnouncement,
} from "./pages/admin";

// Teacher Pages
import {
  TeacherDashboard,
  ManageClass,
  ViewStudents,
  TeacherSettings,
  TeacherAnnouncement,
} from "./pages/teacher";
import TeacherLichess from "./pages/teacher/pages/TeacherLichess";
import LichessIndividualStatPage from "./pages/teacher/components/LichessIndividualStatPage";

// Teacher Components
import ClassSettings from "./pages/teacher/components/ClassSettings";
import ViewClass from "./pages/teacher/components/ViewClass";

// Student Pages
import { StudentSettings, StudentAnnouncements } from "./pages/student";
import MyClasses from "./pages/student/pages/MyClasses";
import ClassPage from "./pages/student/components/MyClassesPages/JoinedClassesPages/ClassPage";
import StudentLichess from "./pages/student/pages/StudentLichess";

// Placeholder components for now - will be created later
const ManageClasses = () => <div>Manage Classes</div>;
const Profile = () => <div>Profile</div>;

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Validate that the user object has required properties
        if (parsedUser && parsedUser.role && parsedUser.id) {
          setUser(parsedUser);
        } else {
          // Invalid user data, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch {
        // Invalid JSON, clear storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (user && user.role) {
    // Redirect based on role only if user has valid role
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin/manage-users" replace />;
      case "teacher":
        return <Navigate to="/teacher/classes" replace />;
      case "student":
        return <Navigate to="/student/classes" replace />;
      default:
        // Invalid role, clear storage and show login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return children;
    }
  }

  return children;
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      // Validate user object
      if (parsedUser && parsedUser.role && parsedUser.id) {
        setUser(parsedUser);
      } else {
        // Invalid user data, clear storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch {
      // Invalid JSON, clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/manage-batches"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <ManageBatches />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/manage-classes"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <ManageClasses />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/manage-users"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <ManageUsers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <AdminAnnouncement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <AdminSettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute requiredRole="teacher">
            <DashboardLayout>
              <TeacherDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/classes"
        element={
          <ProtectedRoute requiredRole="teacher">
            <DashboardLayout>
              <ManageClass />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/classes/batch/:batchName"
        element={
          <ProtectedRoute requiredRole="teacher">
            <DashboardLayout>
              <ClassSettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/classes/batch/:batchName/class/:className"
        element={
          <ProtectedRoute requiredRole="teacher">
            <DashboardLayout>
              <ViewClass />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/attendance"
        element={
          <ProtectedRoute requiredRole="teacher">
            <DashboardLayout>
              <ViewStudents />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/announcements"
        element={
          <ProtectedRoute requiredRole="teacher">
            <DashboardLayout>
              <TeacherAnnouncement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/lichess"
        element={
          <ProtectedRoute requiredRole="teacher">
            <DashboardLayout>
              <TeacherLichess />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/lichess/student/:username"
        element={
          <ProtectedRoute requiredRole="teacher">
            <DashboardLayout>
              <LichessIndividualStatPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/profile"
        element={
          <ProtectedRoute requiredRole="teacher">
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/settings"
        element={
          <ProtectedRoute requiredRole="teacher">
            <DashboardLayout>
              <TeacherSettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/classes"
        element={
          <ProtectedRoute requiredRole="student">
            <DashboardLayout>
              <MyClasses />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/classes/:className"
        element={
          <ProtectedRoute requiredRole="student">
            <DashboardLayout>
              <ClassPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/announcements"
        element={
          <ProtectedRoute requiredRole="student">
            <DashboardLayout>
              <StudentAnnouncements />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/lichess"
        element={
          <ProtectedRoute requiredRole="student">
            <DashboardLayout>
              <StudentLichess />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute requiredRole="student">
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/settings"
        element={
          <ProtectedRoute requiredRole="student">
            <DashboardLayout>
              <StudentSettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Unauthorized Route */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
