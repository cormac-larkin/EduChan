import { Box, Stack, Button, Snackbar, Alert } from "@mui/material";
import QuizQuestion from "./QuizQuestion";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Quiz({ quiz }) {
  const navigate = useNavigate();
  const { quiz_id, questions } = quiz;

  // State to hold the quiz attempt (An array of question objects, where each object contains an array of the selected answer_ids for that question)
  const [quizAttempt, setQuizAttempt] = useState([]);

  // Handles error message from API
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // Submits the quiz attempt
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:5000/quizzes/${quiz_id}/attempts`,
        {
          quizAttempt,
        },
        { withCredentials: true }
      );
      const quizAttemptID = response.data.attemptID;
      // Redirect to the result page for this quiz attempt
      navigate(`/quizzes/attempts/${quizAttemptID}`, {
        state: {
          message: "Quiz submitted successfully! View your results below", // Pass success message to the login page so we can display notification
        },
      });
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.error || "Error: Unable to submit quiz"
      );
      setShowErrorMessage(true);
      console.error(error);
    }
  };

  return (
    <Stack width="100%">
      <Box component="form" onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <QuizQuestion
            key={index}
            question={question}
            questionNumber={index + 1}
            setQuizAttempt={setQuizAttempt}
          />
        ))}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Submit Quiz
        </Button>
      </Box>

      {/* Error message if quiz submission fails  */}
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

export default Quiz;
