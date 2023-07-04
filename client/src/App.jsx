import { useContext, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { ThreeCircles } from "react-loader-spinner";
import TeacherRegistrationPage from "./components/pages/TeacherRegistrationPage";
import StudentRegistrationPage from "./components/pages/StudentRegistrationPage";
import TeacherDashboardPage from "./components/pages/TeacherDashboardPage";
import StudentDashboardPage from "./components/pages/StudentDashboardPage";
import LoginPage from "./components/pages/LoginPage";
import ChatPage from "./components/pages/ChatPage";

import { AuthContext } from "./components/context/AuthProvider";

import "./App.css";

function App() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
  // If AuthProvider API call completes and user is not authenticated, the User is set to null. In this case, we redirect to /login. 
  if (user === null) {
    //navigate("/");
    console.log("Please Log In");
  }
  }, [user, navigate]);

  // User is undefined until AuthProvider API call is finished, show loading spinner while waiting for API response
  if (user === undefined) { 
    return <ThreeCircles />;
  }

  // Otherwise, user is authenticated, render App
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/teacher" element={<TeacherRegistrationPage />} />
      <Route path="/register/student" element={<StudentRegistrationPage />} />
      <Route path="/dashboard/teacher" element={<TeacherDashboardPage />} />
      <Route path="/dashboard/student" element={<StudentDashboardPage />} />
      <Route path="/chat/:roomID" element={<ChatPage />} />
    </Routes>
  );
}

export default App;
