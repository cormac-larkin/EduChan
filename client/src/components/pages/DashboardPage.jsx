import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../authentication/AuthProvider";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import teacherDashboardCards from "../../data/teacherDashboardCards";
import studentDashboardCards from "../../data/studentDashboardCards";
import paperStyles from "../../styles/paperStyles";

import { Divider, Stack, Typography, Grid, Paper, Snackbar, Alert } from "@mui/material";
import DashboardCard from "../UI/DashboardCard";
import { useLocation } from "react-router-dom";

function DashboardPage() {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const cards = user?.isTeacher ? teacherDashboardCards : studentDashboardCards; // Select the dashboard card data for the current user category

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    // On first render, check if a success message was passed from the previous page
    // If so, save it in the 'succcessMessage' state, then set the 'showSuccessMessage' state to true so it will be displayed
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setShowSuccessMessage(true);
      window.history.replaceState(null, ""); // Clear the history state after the message is retrieved
    }
  }, [location]);

  return (
    <Stack>
      <Stack p="1rem" direction="row">
        <Stack justifyContent="center">
          {user?.isTeacher ? (
            <SpaceDashboardRoundedIcon />
          ) : (
            <SchoolRoundedIcon />
          )}
        </Stack>

        <Typography component="h1" variant="h5" align="left" pl="0.5rem">
          <b>{user?.isTeacher ? "Teacher Dashboard" : "Student Dashboard"}</b>
        </Typography>
      </Stack>
      <Divider />

      <Paper elevation={6} sx={paperStyles}>
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
      </Paper>

      {/* Success Message Notification if redirected after logging in */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowSuccessMessage(false)}
        message={successMessage}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={() => setShowSuccessMessage(false)}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default DashboardPage;
