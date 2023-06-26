import "./App.css";
import { Route, Routes } from "react-router-dom";
import TeacherRegistrationPage from "./components/pages/TeacherRegistrationPage";
import StudentRegistrationPage from "./components/pages/StudentRegistrationPage";
import LoginPage from "./components/pages/LoginPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/teacher" element={<TeacherRegistrationPage />} />
      <Route path="/register/student" element={<StudentRegistrationPage />} />
    </Routes>
  );
}

export default App;
