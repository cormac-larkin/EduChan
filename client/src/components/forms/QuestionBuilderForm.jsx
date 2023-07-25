import {
  Accordion,
  AccordionSummary,
  Typography,
  Box,
  InputAdornment,
  TextField,
  IconButton,
  Tooltip,
  Stack,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import paperStyles from "../../styles/paperStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { useTheme } from "@emotion/react";
import AnswerInputField from "./AnswerInputField";
import axios from "axios";

function QuestionBuilderForm({ quiz, questionNumber }) {
  const theme = useTheme();

  // Array to hold AnswerInputFields added by the user
  const [answerInputFields, setAnswerInputFields] = useState([]);

  // State to hold the text of the question
  const [questionText, setQuestionText] = useState("");

  // State to hold answers entered in the AnswerInputFields (AnswerInputFields handle setting this state)
  const [savedAnswers, setSavedAnswers] = useState([]);

  // Form will be disabled after submission
  const [submitted, setSubmitted] = useState(false);

  // States for error/success notifications
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Add a new answer input field when user clicks the 'add' button
  const addInputField = () => {
    setAnswerInputFields((prevFields) => [
      ...prevFields,
      <AnswerInputField
        key={Date.now()}
        answerNumber={answerInputFields.length + 1}
        setSavedAnswers={setSavedAnswers}
        setAnswerInputFields={setAnswerInputFields}
      />,
    ]);
  };

  // Submit the question and its answers to the API
  const handleSubmit = async (e) => {

    if(!questionText || savedAnswers.length === 0) {
        alert("Each Question must have a question prompt and at least one answer")
    }
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/quizzes/${quiz.quiz_id}/`,
        {
          questionText,
          answers: savedAnswers,
        },
        {
          withCredentials: true,
        }
      );
      setSubmitted(true);
      setShowSuccessMessage(true);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.error || "Error: Unable to save question"
      );
      setShowErrorMessage(true);
      console.error(error);
    }
  };

  return (
    <>
      <Accordion
        elevation={10}
        disableGutters
        sx={{ ...paperStyles, borderRadius: "5px", width: "100%" }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
          sx={{ borderBottom: "1px solid grey" }}
        >
          <Typography
            sx={{ width: "75%", flexShrink: 0 }}
            component="h1"
            variant="h5"
          >
            {`Question ${questionNumber}`}
          </Typography>
        </AccordionSummary>
        <Box
          component="form"
          pt="1rem"
          onSubmit={handleSubmit}
          sx={{ cursor: submitted && "not-allowed" }}
        >
          <fieldset disabled={submitted} style={{ border: "none" }}>
            {/* Disable all form fields after submission */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="questionText"
              label="Question Text"
              name="questionText"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              type="text"
              autoFocus
              sx={{ input: { cursor: submitted && "not-allowed" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QuestionMarkIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Stack pl="0.3rem" pt="0.3rem">
              <Stack direction="row" pb="1rem" pt="1rem">
                <Tooltip title="Add answer">
                  <IconButton
                    color="primary"
                    disabled={submitted}
                    aria-label="add answer"
                    sx={{
                      height: "1.5rem",
                      width: "1.5rem",
                      border: `1px solid ${theme.palette.primary.main}`,
                      marginRight: "0.5rem",
                    }}
                    onClick={addInputField}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <Typography variant="text-secondary">Add Answer</Typography>
              </Stack>
              {answerInputFields}
            </Stack>
            <Button
              disabled={submitted}
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Save Question
            </Button>
          </fieldset>
        </Box>

        {/* Success notification if API call succeeds */}
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={showSuccessMessage}
          autoHideDuration={6000}
          onClose={() => setShowSuccessMessage(false)}
          message={"Question added successfully!"}
          sx={{ whiteSpace: "pre-wrap" }}
        >
          <Alert
            severity="success"
            sx={{ width: "100%", whiteSpace: "pre-wrap" }}
            onClose={() => setShowSuccessMessage(false)}
          >
            {"Question Added Successfully!"}
          </Alert>
        </Snackbar>

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
      </Accordion>
    </>
  );
}

export default QuestionBuilderForm;
