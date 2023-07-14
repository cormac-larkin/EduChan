import { useContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { ThreeCircles } from "react-loader-spinner";
import TeacherRegistrationPage from "./components/pages/TeacherRegistrationPage";
import StudentRegistrationPage from "./components/pages/StudentRegistrationPage";
import TeacherDashboardPage from "./components/pages/TeacherDashboardPage";
import StudentDashboardPage from "./components/pages/StudentDashboardPage";
import ChatEnrollmentPage from "./components/pages/ChatEnrollmentPage";
import LoginPage from "./components/pages/LoginPage";
import ChatPage from "./components/pages/ChatPage";

import { AuthContext } from "./components/context/AuthProvider";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, createTheme } from "@mui/material";

import "./App.css";
import Error404Page from "./components/pages/Error404Page";
import Layout from "./components/layout/Layout";

function App() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [darkTheme, setDarkTheme] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkTheme ? "dark" : "light", // Set the theme mode based on the 'darkTheme' state
    },
  });

  useEffect(() => {
    // If AuthProvider API call completes and user is not authenticated, the User is set to null. In this case, we redirect to /login.
    if (user === null) {
      navigate("/login");
      console.log("Please Log In");
    }
  }, [user, navigate]);

  // User is undefined until AuthProvider API call is finished, show loading spinner while waiting for API response
  if (user === undefined) {
    return <ThreeCircles />;
  }

  // Otherwise, user is authenticated, render App
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
          <Route path="/dashboard/" element={ user.isTeacher ? <TeacherDashboardPage /> : <StudentDashboardPage />} />
          <Route path="/chats/:roomID" element={<ChatPage />} />
          <Route path="/chats/:roomID/enrol" element={<ChatEnrollmentPage />} />

          <Route path="*" element={<Error404Page />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
