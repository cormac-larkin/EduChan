import { useContext, useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Snackbar,
  Alert,
  Divider,
  Paper,
  Fab,
  Tooltip,
} from "@mui/material";
import Error404Page from "../error/Error404Page";
import LoadingSpinnerPage from "../error/LoadingSpinnerPage";
import paperStyles from "../../../styles/paperStyles";
import QuizIcon from "@mui/icons-material/Quiz";
import axios from "axios";
import Quiz from "../../forms/quiz/Quiz";
import { AuthContext } from "../../authentication/AuthProvider";
import StopCircleIcon from "@mui/icons-material/StopCircle";

function QuizPage({ quizID, messageID, socket, room, fetchMessages }) {
  const { user } = useContext(AuthContext);

  // State for holding the Quiz object retrieved from the API
  const [quiz, setQuiz] = useState();
  const [loading, setIsLoading] = useState(true);

  // States for handling error messages from the API
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/quizzes/${quizID}`,
        {
          withCredentials: true,
        }
      );
      setQuiz(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setQuiz(null);
      setIsLoading(false);
      setErrorMessage(
        error?.response?.data?.error || "Error: Unable to retrieve quiz"
      );
      setShowErrorMessage(true);
    }
  };

  // Mark the quiz as ended in the database and emit the end-quiz event over websocket, which force submits all open quizzes
  const endQuiz = async () => {
    try {
      await axios.put(`http://localhost:5000/chats/messages/${messageID}/end-quiz`, {}, {
        withCredentials: true
      })
      await socket.emit("end-quiz", room.title);
      fetchMessages();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchQuiz();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Display Loading animation while API call is in progress
  if (loading) {
    return <LoadingSpinnerPage />;
  }

  // If no room with the specified ID is found, render the 404 Error Page
  if (quiz === null) {
    return <Error404Page />;
  }

  return (
    <Stack>
      <Stack p="1rem" direction="row">
        <Stack justifyContent="center">
          <QuizIcon />
        </Stack>
        <Stack
          direction="row"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack pl="0.5rem">
            <Typography component="h1" variant="h5" align="left">
              {user.isTeacher ? (
                <b>{`'${quiz.title}'`}</b>
              ) : (
                <b>{`Take the '${quiz.title}' quiz`}</b>
              )}
            </Typography>
            {quiz.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                align="left"
                paddingLeft="0.2rem"
              >
                {quiz.description}
              </Typography>
            )}
          </Stack>
          {user.isTeacher && (
            <Tooltip title="End Quiz">
              <Fab size="small" onClick={endQuiz}>
                <StopCircleIcon />
              </Fab>
            </Tooltip>
          )}
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
        <Quiz quiz={quiz} socket={socket} />
      </Paper>

      {/* Error message if API call fails  */}
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

export default QuizPage;
