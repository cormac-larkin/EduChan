import { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Snackbar,
  Alert,
  Divider,
  Paper,
} from "@mui/material";
import Error404Page from "../error/Error404Page";
import LoadingSpinnerPage from "../error/LoadingSpinnerPage";
import paperStyles from "../../../styles/paperStyles";
import QuizIcon from "@mui/icons-material/Quiz";
import axios from "axios";
import { useParams } from "react-router-dom";
import Quiz from "../../forms/quiz/Quiz";

function QuizPage() {
  const { quizID } = useParams();

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
        <Stack pl="0.5rem">
          <Typography component="h1" variant="h5" align="left">
            <b>{`Take the '${quiz.title}' quiz`}</b>
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
        <Quiz quiz={quiz} />
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
