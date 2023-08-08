import axios from "axios";
import { useContext, useEffect, useState } from "react";
import {
  Snackbar,
  Alert,
  Stack,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import LoadingSpinnerPage from "../error/LoadingSpinnerPage";
import QuizIcon from "@mui/icons-material/Quiz";
import paperStyles from "../../../styles/paperStyles";
import QuizQuestionAttempt from "../../forms/quiz/QuizQuestionAttempt";
import { AuthContext } from "../../authentication/AuthProvider";

function ViewQuizAttemptPage({ quizID }) {

  const { user } = useContext(AuthContext);

  // State for holding the Quiz Attempt object retrieved from the API
  const [quizAttempt, setQuizAttempt] = useState();
  const [loading, setIsLoading] = useState(true);

  // States for handling error messages from the API
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const fetchQuizAttempt = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/users/${user.id}/quizzes/${quizID}/attempts/`,
        { withCredentials: true }
      );

      // If no attempt is found for this user for the quiz, render a message instad of the results page
      if(response?.data.quiz_attempt?.length === 0) {
        setQuizAttempt(null);
        setIsLoading(false);
        return;
      }
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
    fetchQuizAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Display Loading animation while API call is in progress
  if (loading) {
    return <LoadingSpinnerPage />;
  }

  // If no room with the specified ID is found, render the 404 Error Page
  if (!quizAttempt) {
    return <>--- Quiz Ended ---</>;
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
        {quizAttempt?.questions.map((question, index) => (
          <QuizQuestionAttempt
            key={index}
            question={question}
            questionNumber={index + 1}
          />
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

    </Stack>
  );
}

export default ViewQuizAttemptPage;
