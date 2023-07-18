import { useContext } from "react";
import { AuthContext } from "../authentication/AuthProvider";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import chatBubbleIcon from "../../assets/chatBubble.svg";
import newChatIcon from "../../assets/newChat.svg";
import analyticsIcon from "../../assets/analytics.svg";
import quizIcon from "../../assets/quiz.svg";
import settingsIcon from "../../assets/settings.svg";
import logoutIcon from "../../assets/logout.svg";

import { Container, Divider, Stack, Typography, Grid } from "@mui/material";
import DashboardCard from "../UI/DashboardCard";

function TeacherDashboardPage() {
  const { user } = useContext(AuthContext);

  const cards = [
    {
      title: "Browse Chats",
      description: "View your chats",
      imageURI: chatBubbleIcon,
    },
    {
      title: "Create New Chat",
      description: "Create a new chat and enrol Students",
      imageURI: newChatIcon,
    },
    {
      title: "Analytics",
      description: "View word clouds, sentiment analysis and more",
      imageURI: analyticsIcon,
    },
    {
      title: "Create Quizzes",
      description: "Create new quizzes to test your Students",
      imageURI: quizIcon,
    },
    {
      title: "My Account",
      description: "Manage your account",
      imageURI: settingsIcon,
    },
    {
      title: "Logout",
      description: "Log out of your account",
      imageURI: logoutIcon,
    },
  ];

  return (
    <Stack>
      <Stack p="1rem" direction="row">
        <Stack justifyContent="center">
          <SpaceDashboardRoundedIcon />
        </Stack>
        <Typography component="h1" variant="h5" align="left" pl="0.5rem">
          Teacher Dashboard
        </Typography>
      </Stack>
      <Divider />
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
        pt="1rem"
      >
        {cards.map((card, index) => (
          <Grid
            item
            xs={2}
            sm={4}
            md={4}
            key={index}
            display={"flex"}
            justifyContent={"center"}
          >
            <DashboardCard card={card} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default TeacherDashboardPage;
