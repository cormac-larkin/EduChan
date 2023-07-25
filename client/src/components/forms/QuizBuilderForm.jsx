import { Stack, Typography, Fab, Tooltip, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import QuestionBuilderForm from "./QuestionBuilderForm";

function QuizBuilderForm({ quiz }) {
  const theme = useTheme();
  // State to hold the number of questions this quiz will have
  const [questionBuilderForms, setQuestionBuilderForms] = useState([]);

  // Adds a QuestionBuilder form in response to User clicking the 'Add Button'
  const addQuestionBuilderForm = () => {
    setQuestionBuilderForms((prevForms) => [
      ...prevForms,
      <QuestionBuilderForm
        key={Date.now()}
        questionNumber={questionBuilderForms.length + 1}
        quiz={quiz}
      />,
    ]);
  };

  return (
    <Stack sx={{ width: "100%", mr: "1rem" }}>
      <Stack>
        {/* Button to add Questions to quiz */}
        <Tooltip title="Add question">
          <Fab
            color="success"
            variant="extended"
            aria-label="add question"
            sx={{
              margin: 0,
              top: "auto",
              right: 20, // Make button float in bottom right corner
              bottom: 20,
              left: "auto",
              position: "fixed",
            }}
            onClick={addQuestionBuilderForm}
          >
            <AddIcon />
            Add Question
          </Fab>
        </Tooltip>
      </Stack>
      <Typography
        component="h1"
        variant="h4"
        align="center"
        paddingTop="0.5rem"
      >
        {quiz.title}
      </Typography>
      {quiz.description && (
        <Typography
          component="h4"
          variant="subtitle1"
          align="center"
          paddingBottom="0.5rem"
        >
          {quiz.description}
        </Typography>
      )}

      {/* Render the array of QuestionBuilder forms constructed above */}
      {questionBuilderForms}
    </Stack>
  );
}

export default QuizBuilderForm;
