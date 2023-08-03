import { Box, Stack, Snackbar, Alert } from "@mui/material";
import QuizQuestion from "./QuizQuestion";
import { useEffect, useState } from "react";
import axios from "axios";

function Quiz({ quiz, socket }) {
  const { quiz_id, questions } = quiz;

  // State to hold the quiz attempt (An array of question objects, where each object contains an array of answer objects with the answer id and whether the answer was selected or not)
  const [quizAttempt, setQuizAttempt] = useState([]);

  // Handles error message from API
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // Submits the quiz attempt
  const handleSubmit = async (e = null) => {
    if (e) {
      e.preventDefault();
    }

    try {
      await axios.post(
        `http://localhost:5000/quizzes/${quiz_id}/attempts`,
        {
          quizAttempt,
        },
        { withCredentials: true }
      );
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.error || "Error: Unable to submit quiz"
      );
      setShowErrorMessage(true);
      console.error(error);
    }
  };

  useEffect(() => {
    const handleEndQuiz = () => {
      handleSubmit();
    };

    socket.on("end-quiz", handleEndQuiz);

    return () => {
      socket.off("end-quiz", handleEndQuiz);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, quizAttempt]);

  return (
    <Stack width="100%">
      <Box component="form" onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <QuizQuestion
            key={index}
            question={question}
            questionNumber={index + 1}
            setQuizAttempt={setQuizAttempt}
            socket={socket}
          />
        ))}
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
