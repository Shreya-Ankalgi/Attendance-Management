import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import SignupPage from "./pages/SignupPage";
import StudentHomePage from "./pages/StudentHomePage.jsx";
import StudentDashboard from "./components/StudentDashboard.jsx";
import ClientHomePage from "./pages/ClientHomePage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuthStore } from "./store/useAuthStore.js";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore.js";
import Landing from "./pages/Landing.jsx";
import ClientAttendance from "./pages/ClientAttendance.jsx";

const App = () => {
  const [isStudent, setIsStudent] = useState(false)


  
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const [isLanding, setIsLanding] = useState(false)
  const navigate = useNavigate(); 
  const location=useLocation()


  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      if (authUser.role === "student") {
        setIsStudent(true)
        navigate("/student-dashboard");
      } else {
        navigate("/client-dashboard");
      }
    }
  }, [authUser]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

 
 
  return (
    <div data-theme={theme}>
      <Navbar isStudent={isStudent}  />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing/>} />
        <Route path="/signup" element={<SignupPage /> } />
        <Route path="/login" element={ <LoginPage /> } />

        {/* Protected Routes for Students */}
        {authUser?.role === "student" && (
          <>
            <Route path="/student-dashboard" element={authUser?<StudentHomePage />:<LoginPage/>} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </>
        )}

        {/* Protected Routes for Clients */}
        {authUser?.role !== "student" && (
          <>
            <Route path="/client-dashboard" element={authUser?<ClientHomePage />:<LoginPage/>} />
            <Route path="/client-attendance" element={authUser?<ClientAttendance />:<LoginPage/>} />

            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </>
        )}
       

        {/* Default Route */}
        {/* <Route path="/" element={<Navigate to={authUser ? "/student-dashboard" : "/login"} />} /> */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
