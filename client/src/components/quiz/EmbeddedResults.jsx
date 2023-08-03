import { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Snackbar,
  Alert,
  Divider,
  Paper,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import Error404Page from "../pages/error/Error404Page";
import LoadingSpinnerPage from "../pages/error/LoadingSpinnerPage";
import paperStyles from "../../styles/paperStyles";
import QuizIcon from "@mui/icons-material/Quiz";
import axios from "axios";

function EmbeddedResults({ quizID, socket, activeUsers }) {
  // State for holding the Quiz object retrieved from the API
  const [quiz, setQuiz] = useState();
  const [loading, setIsLoading] = useState(true);

  // States for handling error messages from the API
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // States for tracking which questions were answered correctly/incorrectly
  const [questionResults, setQuestionResults] = useState(null);

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

  useEffect(() => {
    if (quiz) {
      // Initialize questionResults with the correct structure based on the fetched quiz data
      // An array of objects. Each socket has its own object with its ID and an array of the answers for each question (true/false/ or null if not answered)
      setQuestionResults(
        activeUsers.map((activeUserID) => ({
          socketID: activeUserID,
          answers: quiz?.questions.map(() => null),
        }))
      );

      // After quiz is retrieved and the questionResults state is initialized correctly, begin listening for new answers from clients
      socket.on("new-answer", (newAnswer) => {
        // Destructure the properties from the newAnswer object (transmitted over websocket)
        const { socketID, questionIndex, isCorrect } = newAnswer;

        setQuestionResults((prevResults) => {
          // Find the object with this socketID in the previous results state
          const objToUpdate = prevResults.find(
            (obj) => obj.socketID === socketID
          );

          // If the object is not found, return the previous state without any changes
          if (!objToUpdate) {
            return prevResults;
          }

          // Create a new array of answers by copying the original answers array
          const updatedAnswers = [...objToUpdate.answers];

          // Update the specific question's answer with the newest state (true for correct/false for incorrect)
          updatedAnswers[questionIndex] = isCorrect;

          // Return a new object with the updated answers array
          const updatedObject = { ...objToUpdate, answers: updatedAnswers };

          // Return the updated state with the replaced object for this socketID
          return prevResults.map((obj) =>
            obj.socketID === socketID ? updatedObject : obj
          );
        });
      });

      // // When clients disconnect, remove their object from the questionResults
      // socket.on("disconnect", (socketID) => {
      //   setQuestionResults((prevResults) => prevResults.filter((obj) => obj.socketID !== socketID));
      // })
    }
  }, [loading]);

  // Display Loading animation while API call is in progress
  if (loading || !questionResults) {
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
            <b>{`Live Results: '${quiz.title}'`}</b>
          </Typography>
          <Typography variant="text.secondary" align="left">
            <b>{`Participants: ${activeUsers.length}`}</b>
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
        <List>
          {quiz?.questions.map((question, index) => {
            // Get the number of correct answers for this question
            const correctAnswers = questionResults.reduce((total, user) => {
              if (user.answers[index] === true) {
                return total + 1; 
              }
              return total;
            }, 0);

            // Get the number of incorrect answers for this question
            const incorrectAnswers = questionResults.reduce((total, user) => {
              if (user.answers[index] === false) {
                return total + 1; 
              }
              return total;
            }, 0);

            // Get the number of participants who have not answered this question yet
            const unanswered = questionResults.reduce((total, user) => {
              if (user.answers[index] === null) {
                return total + 1; 
              }
              return total;
            }, 0);

            return (
              <ListItemButton
                key={index}
                sx={{ borderBottom: "1px solid grey" }}
              >
                <ListItemText
                  primary={`${index + 1}. ${question.content}`}
                  secondary={`Correct: ${correctAnswers} || Incorrect: ${incorrectAnswers} || No answer: ${unanswered}`}
                />
              </ListItemButton>
            );
          })}
        </List>
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

export default EmbeddedResults;
