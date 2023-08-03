import {
  Accordion,
  AccordionSummary,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Stack,
  Tooltip,
  Button,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import paperStyles from "../../../styles/paperStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@emotion/react";
import AnswerEditorForm from "./AnswerEditorForm";
import axios from "axios";

function QuestionEditorForm({ quiz, question, questionNumber, fetchQuiz }) {
    const theme = useTheme();

  // State to hold/edit the text of the question (Starting value is existing question content)
  const [questionText, setQuestionText] = useState(question.content);

  // State to hold/edit existing answers (AnswerEditorForms handle setting this state)
  const [savedAnswers, setSavedAnswers] = useState([]);

  // States for error/success notifications
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Submit the question and its answers to the API
  const handleSubmit = async (e) => {

    e.preventDefault();

    if(!questionText || savedAnswers.length === 0) {
        alert("Each Question must have a question prompt and at least one answer")
        return;
    }
    
    try {
      await axios.put(
        `http://localhost:5000/quizzes/${quiz.quiz_id}/questions/${question.question_id}`,
        {
          questionText,
          answers: savedAnswers,
        },
        {
          withCredentials: true,
        }
      );
      setShowSuccessMessage(true);
      
      fetchQuiz(); // Fetch the new version of the quiz from the API so all existing questions will be displayed on the QuizBuilderForm

    } catch (error) {
      setErrorMessage(
        error?.response?.data?.error || "Error: Unable to edit question"
      );
      setShowErrorMessage(true);
      console.error(error);
    }
  };

  return (
    <>
      <Accordion
        defaultExpanded={true}
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
        <Box component="form" pt="1rem" onSubmit={handleSubmit}>
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
                  aria-label="add answer"
                  sx={{
                    height: "1.5rem",
                    width: "1.5rem",
                    border: `1px solid ${theme.palette.primary.main}`,
                    marginRight: "0.5rem",
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="text-secondary">Add Answer</Typography>
            </Stack>
        
        {question?.answers?.map((answer, index) => (
            <AnswerEditorForm key={index} answer={answer} setSavedAnswers={setSavedAnswers} />
        ))}
            

          </Stack>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Edit Question
          </Button>
        </Box>

        {/* Success notification if API call succeeds */}
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={showSuccessMessage}
          autoHideDuration={6000}
          onClose={() => setShowSuccessMessage(false)}
          message={"Question edited successfully!"}
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

export default QuestionEditorForm;
