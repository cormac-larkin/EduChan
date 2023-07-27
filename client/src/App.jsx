import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import TeacherRegistrationPage from "./components/pages/auth/TeacherRegistrationPage";
import StudentRegistrationPage from "./components/pages/auth/StudentRegistrationPage";
import DashboardPage from "./components/pages/DashboardPage";
import ChatEnrollmentPage from "./components/pages/chat/ChatEnrollmentPage";
import BrowseChatsPage from "./components/pages/chat/BrowseChatsPage";
import ChatCreationPage from "./components/pages/chat/ChatCreationPage";
import LoginPage from "./components/pages/auth/LoginPage";
import ChatRoomPage from "./components/pages/chat/ChatRoomPage";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, createTheme } from "@mui/material";

import "./App.css";
import Error404Page from "./components/pages/error/Error404Page";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/authentication/ProtectedRoute";
import NoSideBarLayout from "./components/layout/NoSideBarLayout";
import AccountApprovalPage from "./components/pages/AccountApprovalPage";
import QuizCreationPage from "./components/pages/quiz/QuizCreationPage";
import QuizBuilderPage from "./components/pages/quiz/QuizBuilderPage";
import QuizPage from "./components/pages/quiz/QuizPage";
import QuizAttemptsPage from "./components/pages/quiz/QuizAttemptsPage";

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

      <Routes>
        <Route path="/login" element={<NoSideBarLayout onThemeChange={setDarkTheme}> <LoginPage /> </NoSideBarLayout>} />
        <Route path="/register/teacher" element={<NoSideBarLayout onThemeChange={setDarkTheme}> <TeacherRegistrationPage /> </NoSideBarLayout>} />
        <Route path="/register/student" element={<NoSideBarLayout onThemeChange={setDarkTheme}> <StudentRegistrationPage /> </NoSideBarLayout>} />

        <Route path="/dashboard/" element={<Layout onThemeChange={setDarkTheme}> <ProtectedRoute> <DashboardPage /> </ProtectedRoute> </Layout>} />

        <Route path="/chats/" element={<Layout onThemeChange={setDarkTheme}> <ProtectedRoute> <BrowseChatsPage /> </ProtectedRoute> </Layout>} />
        <Route path="/chats/create" element={<Layout onThemeChange={setDarkTheme}> <ProtectedRoute permissionLevel={"Teacher"}> <ChatCreationPage /> </ProtectedRoute> </Layout>} />
        <Route path="/chats/:roomID" element={<Layout onThemeChange={setDarkTheme}> <ProtectedRoute> <ChatRoomPage /> </ProtectedRoute> </Layout>} />
        <Route path="/chats/:roomID/enrol" element={<Layout onThemeChange={setDarkTheme}> <ProtectedRoute permissionLevel={"Teacher"}> <ChatEnrollmentPage /> </ProtectedRoute> </Layout>} />

        <Route path="/quizzes/create" element={<Layout onThemeChange={setDarkTheme}> <ProtectedRoute permissionLevel={"Teacher"}> <QuizCreationPage /> </ProtectedRoute> </Layout>} />
        <Route path="/quizzes/attempts/" element={<Layout onThemeChange={setDarkTheme}> <ProtectedRoute> <QuizAttemptsPage /> </ProtectedRoute> </Layout>} />
        <Route path="/quizzes/:quizID/" element={<Layout onThemeChange={setDarkTheme}> <ProtectedRoute> <QuizPage /> </ProtectedRoute> </Layout>} />
        <Route path="/quizzes/:quizID/edit" element={<Layout onThemeChange={setDarkTheme}> <ProtectedRoute permissionLevel={"Teacher"}> <QuizBuilderPage /> </ProtectedRoute> </Layout>} />
       
        <Route path="/approvals/" element={<Layout onThemeChange={setDarkTheme}> <ProtectedRoute permissionLevel={"Admin"}> <AccountApprovalPage /> </ProtectedRoute> </Layout>} />

        <Route path="*" element={<Error404Page />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
