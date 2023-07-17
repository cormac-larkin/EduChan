import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import TeacherRegistrationPage from "./components/pages/TeacherRegistrationPage";
import StudentRegistrationPage from "./components/pages/StudentRegistrationPage";
import TeacherDashboardPage from "./components/pages/TeacherDashboardPage";
import ChatEnrollmentPage from "./components/pages/ChatEnrollmentPage";
import LoginPage from "./components/pages/LoginPage";
import ChatPage from "./components/pages/ChatPage";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, createTheme } from "@mui/material";

import "./App.css";
import Error404Page from "./components/pages/Error404Page";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/authentication/ProtectedRoute";

function App() {

  const [darkTheme, setDarkTheme] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkTheme ? "dark" : "light", // Set the theme mode based on the 'darkTheme' state
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout onThemeChange={setDarkTheme}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/register/teacher"
            element={<TeacherRegistrationPage />}
          />
          <Route
            path="/register/student"
            element={<StudentRegistrationPage />}
          />
          <Route
            path="/dashboard/"
            element={
              <ProtectedRoute>
                <TeacherDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats/:roomID"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats/:roomID/enrol"
            element={
              <ProtectedRoute>
                <ChatEnrollmentPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Error404Page />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
