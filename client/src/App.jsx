import { Route, Routes } from "react-router-dom";
import TeacherRegistrationPage from "./components/pages/TeacherRegistrationPage";
import StudentRegistrationPage from "./components/pages/StudentRegistrationPage";
import TeacherDashboardPage from "./components/pages/TeacherDashboardPage";
import StudentDashboardPage from "./components/pages/StudentDashboardPage";
import LoginPage from "./components/pages/LoginPage";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/teacher" element={<TeacherRegistrationPage />} />
      <Route path="/register/student" element={<StudentRegistrationPage />} />
      <Route path="/dashboard/teacher" element={<TeacherDashboardPage />} />
      <Route path="/dashboard/student" element={<StudentDashboardPage />} />
    </Routes>
  );
}

export default App;
