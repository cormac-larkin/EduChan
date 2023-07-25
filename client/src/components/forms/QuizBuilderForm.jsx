import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";
import NumbersIcon from "@mui/icons-material/Numbers";
import { useRef, useState } from "react";
import QuestionBuilderForm from "./QuestionBuilderForm";

function QuizBuilderForm({ quiz }) {
  const numberOfQuestionsRef = useRef(null);

  // State to hold the number of questions this quiz will have
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);

  // States to handle showing error messages from API
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // Sets the number of questions this quiz will have. This determines how many QuestionBuilderForms are rendered
  const submitNumberOfQuestions = (e) => {
    e.preventDefault();

    // Access the input value using the ref and convert it to an integer
    const inputValue = parseInt(numberOfQuestionsRef.current.value, 10);
    setNumberOfQuestions(inputValue);
  };

  // Create an array of QuestionBuilderForms based on the number of questions selected by the user
  const questionBuilderForms = [];
  for (let i = 0; i < numberOfQuestions; i++) {
    questionBuilderForms.push(
      <QuestionBuilderForm key={i} questionNumber={i + 1} quiz={quiz} />
    );
  }

  return (
    <>
      {/* Form for setting quiz length (hide once number of questions is chosen) */}
      {!numberOfQuestions && (
        <Stack>
          <Typography
            component="h1"
            variant="h4"
            align="center"
            paddingBottom="1rem"
          >
            Set Quiz Length
          </Typography>
          <Box component="form" onSubmit={submitNumberOfQuestions}>
            <TextField
              inputRef={numberOfQuestionsRef}
              margin="normal"
              required
              fullWidth
              id="numberOfQuestions"
              label="Number of Questions"
              name="numberOfQuestions"
              type="number"
              autoFocus
              inputProps={{
                max: 50,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <NumbersIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Continue
            </Button>
          </Box>
        </Stack>
      )}

      {/* Render the array of QuestionBuilder forms constructed above */}
      {numberOfQuestions > 1 && (
        <Typography
          component="h1"
          variant="h4"
          align="center"
          paddingBottom="1rem"
        >
          Create Questions
        </Typography>
      )}
      {questionBuilderForms}

      {/* Error notification if API call fails */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showErrorMessage}
        autoHideDuration={6000}
        onClose={() => setShowErrorMessage(false)}
      >
        <Alert
          severity="error"
          sx={{ width: "100%" }}
          onClose={() => setShowErrorMessage(false)}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default QuizBuilderForm;
