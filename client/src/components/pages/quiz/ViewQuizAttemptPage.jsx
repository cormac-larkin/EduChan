import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Snackbar, Alert, Stack, Typography, Paper, Divider } from "@mui/material";
import LoadingSpinnerPage from "../error/LoadingSpinnerPage";
import QuizIcon from "@mui/icons-material/Quiz";
import Error404Page from "../error/Error404Page";
import paperStyles from "../../../styles/paperStyles";
import QuizQuestionAttempt from "../../forms/quiz/QuizQuestionAttempt";

function ViewQuizAttemptPage() {
  const location = useLocation();
  const { attemptID } = useParams();

  // State for holding the Quiz Attempt object retrieved from the API
  const [quizAttempt, setQuizAttempt] = useState();
  const [loading, setIsLoading] = useState(true);

  // States for handling success message after re-direct from the QuizPage
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // States for handling error messages from the API
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const fetchQuizAttempt = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/quizzes/attempts/${attemptID}`,
        { withCredentials: true }
      );
      setQuizAttempt(response?.data?.quiz_attempt);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setQuizAttempt(null);
      setIsLoading(false);
      setErrorMessage(
        error?.response?.data?.error || "Error: Unable to retrieve quiz result"
      );
      setShowErrorMessage(true);
    }
  };

  useEffect(() => {
    // On first render, check if a success message was passed from the previous page
    // If so, save it in the 'succcessMessage' state, then set the 'showSuccessMessage' state to true so it will be displayed
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setShowSuccessMessage(true);
      window.history.replaceState(null, ""); // Clear the history state after the message is retrieved
    }
    fetchQuizAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Display Loading animation while API call is in progress
  if (loading) {
    return <LoadingSpinnerPage />;
  }

  // If no room with the specified ID is found, render the 404 Error Page
  if (quizAttempt === null) {
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
            <b>{`Review attempt for '${quizAttempt?.quiz_title}' quiz`}</b>
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
        {quizAttempt.questions.map((question, index) => (
          <QuizQuestionAttempt key={index} question={question} questionNumber={index + 1}/>
        ))}
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

      {/* Success message after redirect from Quiz component */}
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

export default ViewQuizAttemptPage;
