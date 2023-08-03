import { Stack, Typography, Fab, Tooltip, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import QuestionBuilderForm from "./QuestionBuilderForm";
import QuestionEditorForm from "./QuestionEditorForm";

function QuizBuilderForm({ quiz, fetchQuiz }) {
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
        fetchQuiz={fetchQuiz}
        setQuestionBuilderForms={setQuestionBuilderForms}
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

      {/* Render header only if there are existing questions */}
      {quiz?.questions[0]?.question_id && (
        <Typography
          component="h1"
          variant="h4"
          align="center"
          paddingTop="0.5rem"
        >
          {"Edit Existing Questions"}
        </Typography>
      )}

      {/* Render question editor forms only if there are existing questions to edit */}
      {quiz?.questions[0]?.question_id &&
        quiz?.questions.map((question, index) => (
          <QuestionEditorForm
            key={index}
            question={question}
            questionNumber={index + 1}
            quiz={quiz}
            fetchQuiz={fetchQuiz}
          />
        ))}

      {questionBuilderForms.length > 0 && (
        <Typography
          component="h1"
          variant="h4"
          align="center"
          paddingTop="0.5rem"
          paddingBottom="0.5rem"
        >
          {"Add New Questions"}
        </Typography>
      )}
      <Divider />

      {/* Render the array of QuestionBuilder forms constructed above */}
      {questionBuilderForms}
    </Stack>
  );
}

export default QuizBuilderForm;
