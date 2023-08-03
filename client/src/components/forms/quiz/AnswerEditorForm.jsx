import { useState, useEffect } from "react";
import { Stack, Tooltip, Checkbox, TextField, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function AnswerEditorForm({ answer, setSavedAnswers }) {
  // State to hold answer object (contains id, answerText and isCorrect). Initial state is set to the existing values for the question we are editing
  const [editedAnswer, setEditedAnswer] = useState({
    id: answer.answer_id,
    answerText: answer.content,
    isCorrect: answer.is_correct,
  });

  const handleCheckBoxChange = (e) => {
    if (e.target.checked) {
      setEditedAnswer({ ...editedAnswer, isCorrect: true });
    } else {
      setEditedAnswer({ ...editedAnswer, isCorrect: false });
    }
  };

  const handleAnswerTextChange = (e) => {
    setEditedAnswer({ ...editedAnswer, answerText: e.target.value });
  };

  // After the answer is updated, update the savedAnswers state of the parent component.
  // If this answer already exists in the savedAnswers state, update it. Otherwise add it to the state
  useEffect(() => {
    setSavedAnswers((prevAnswers) => {
      if (prevAnswers.some((item) => item.id === editedAnswer.id)) {
        return prevAnswers.map((obj) =>
          obj.id === editedAnswer.id ? editedAnswer : obj
        );
      } else {
        return [...prevAnswers, editedAnswer];
      }
    });
  }, [editedAnswer, setSavedAnswers]);

  return (
    <Stack direction="row" width="100%" alignItems="center">
      <Stack justifyContent="center" pt="1rem">
        <Tooltip title="Mark as correct">
          <Checkbox
            color="success"
            name="isCorrect"
            onChange={(e) => handleCheckBoxChange(e)}
            checked={editedAnswer.isCorrect}
          />
        </Tooltip>
      </Stack>
      <TextField
        required
        id={editedAnswer.answer_id}
        label={`Type Answer`}
        variant="standard"
        name="answerText"
        value={editedAnswer.answerText}
        onChange={(e) => handleAnswerTextChange(e)}
        sx={{ width: "100%" }}
      />
      <Stack justifyContent="center" pt="1rem">
        <Tooltip title="Delete answer">
          <IconButton
            color="error"
            aria-label="delete answer"
            sx={{
              height: "2rem",
              width: "2rem",
              marginRight: "0.5rem",
            }}
            // ONCLICK FOR DELETING ANSWER??
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

export default AnswerEditorForm;
