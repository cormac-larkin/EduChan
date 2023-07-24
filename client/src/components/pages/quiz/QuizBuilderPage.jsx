import { useState } from "react";
import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  Snackbar,
  Alert,
  Stack,
  Typography,
  Divider,
  Paper,
} from "@mui/material";
import LoadingSpinnerPage from "../error/LoadingSpinnerPage";
import Error404Page from "../error/Error404Page";
import BuildIcon from "@mui/icons-material/Build";
import paperStyles from "../../../styles/paperStyles";
import axios from "axios";
import QuizBuilderForm from "../../forms/QuizBuilderForm";

function QuizBuilderPage() {
  const location = useLocation();
  const { quizID } = useParams();

  // State for holding the Quiz object retrieved from the API
  const [quiz, setQuiz] = useState();
  const [loading, setIsLoading] = useState(true);

  // States for handling success message after re-direct from the previous page
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
    // On first render, check if a success message was passed from the previous page
    // If so, save it in the 'succcessMessage' state, then set the 'showSuccessMessage' state to true so it will be displayed
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setShowSuccessMessage(true);
      window.history.replaceState(null, ""); // Clear the history state after the message is retrieved
    }
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

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
          <BuildIcon />
        </Stack>

        <Typography component="h1" variant="h5" align="left" pl="0.5rem">
          <b>{`Build the '${quiz.title}' quiz`}</b>
        </Typography>
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
        <QuizBuilderForm />
      </Paper>

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

export default QuizBuilderPage;
