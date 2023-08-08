import {
  Paper,
  Stack,
  Typography,
  Divider,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../authentication/AuthProvider";
import paperStyles from "../../../styles/paperStyles";
import InsightsIcon from "@mui/icons-material/Insights";
import axios from "axios";
import AnalyticsChatCard from "./AnalyticsChatCard";
import QuizCard from "../../UI/QuizCard";

function AnalyticsDashboardPage() {
  const { user } = useContext(AuthContext);

  // State for holding chats fetched from the API
  const [chats, setChats] = useState([]);

  // State for holding quizzes fetched from the API
  const [quizzes, setQuizzes] = useState([]);

  // States for handling API errors
  const [errorMessage, setErrorMessage] = useState(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  /**
   * Sends a GET request to the API to retrieve all chats owned by a User.
   * Updates the 'chats' state with the latest data returned by the API.
   */
  const fetchOwnedChats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/users/${user.id}/chats/owned`,
        {
          withCredentials: true,
        }
      );
      setChats(response.data);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.error || "Error: Unable to retrieve chats"
      );
      setShowErrorMessage(true);
      console.error(error);
    }
  };

  const fetchOwnedQuizzes = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/users/${user.id}/quizzes`,
        { withCredentials: true }
      );
      setQuizzes(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOwnedQuizzes();
    fetchOwnedChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On first render, fetch all the User's chats from the database.
  useEffect(() => {
    fetchOwnedChats();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack>
      <Stack p="1rem" direction="row">
        <Stack justifyContent="center">
          <InsightsIcon />
        </Stack>
        <Stack pl="0.5rem">
          <Typography component="h1" variant="h5" align="left">
            <b>{`Analytics Hub`}</b>
          </Typography>
        </Stack>
      </Stack>
      <Divider />

      <Paper
        elevation={6}
        sx={{
          ...paperStyles,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "0.5rem",
        }}
      >
        <Typography
          sx={{ width: "100%", flexShrink: 0, pl: "1rem", pb: "0.5rem" }}
          component="h1"
          variant="h5"
        >
          {"View Analytics by Chat"}
        </Typography>
        <Divider sx={{ width: "100%" }} />
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          pt="1rem"
        >
          {chats.map((chat, index) => (
            <Grid
              item
              xs={2}
              sm={4}
              md={4}
              key={index}
              display={"flex"}
              justifyContent={"center"}
            >
              <AnalyticsChatCard chat={chat} />
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper
        elevation={6}
        sx={{
          ...paperStyles,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "0.5rem",
        }}
      >
        <Typography
          sx={{ width: "100%", flexShrink: 0, pl: "1rem", pb: "0.5rem" }}
          component="h1"
          variant="h5"
        >
          {"View Quiz Reports"}
        </Typography>
        <Divider sx={{ width: "100%" }} />

        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          pt="1rem"
        >
          {quizzes.map((quiz, index) => (
            <Grid
              item
              xs={2}
              sm={4}
              md={4}
              key={index}
              display={"flex"}
              justifyContent={"center"}
            >
              <QuizCard quiz={quiz} hasReportLink={true} />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Error notification if API call fails */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showErrorMessage}
        autoHideDuration={6000}
        onClose={() => setShowErrorMessage(false)}
        message={errorMessage}
      >
        <Alert
          severity="error"
          sx={{ width: "100%" }}
          onClose={() => setShowErrorMessage(false)}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default AnalyticsDashboardPage;
