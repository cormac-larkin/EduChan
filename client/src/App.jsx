import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import TeacherRegistrationPage from "./components/pages/TeacherRegistrationPage";
import StudentRegistrationPage from "./components/pages/StudentRegistrationPage";
import DashboardPage from "./components/pages/DashboardPage";
import ChatEnrollmentPage from "./components/pages/ChatEnrollmentPage";
import BrowseChatsPage from "./components/pages/BrowseChatsPage";
import ChatCreationPage from "./components/pages/ChatCreationPage";
import LoginPage from "./components/pages/LoginPage";
import ChatRoomPage from "./components/pages/ChatRoomPage";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, createTheme } from "@mui/material";

import "./App.css";
import Error404Page from "./components/pages/Error404Page";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/authentication/ProtectedRoute";
import NoSideBarLayout from "./components/layout/NoSideBarLayout";

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
        <Route path="/chats/create" element={<Layout onThemeChange={setDarkTheme}> <ProtectedRoute> <ChatCreationPage /> </ProtectedRoute> </Layout>} />
        <Route path="/chats/:roomID" element={<Layout onThemeChange={setDarkTheme}> <ProtectedRoute> <ChatRoomPage /> </ProtectedRoute> </Layout>} />
        <Route path="/chats/:roomID/enrol" element={<Layout onThemeChange={setDarkTheme}><ProtectedRoute> <ChatEnrollmentPage /> </ProtectedRoute> </Layout>} />

        <Route path="*" element={<Error404Page />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
