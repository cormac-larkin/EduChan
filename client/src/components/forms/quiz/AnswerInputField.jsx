import { Stack, TextField, Tooltip, IconButton, Checkbox } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useRef, useEffect } from "react";

function AnswerInputField({
  answerNumber,
  setAnswerInputFields,
  setSavedAnswers,
}) {
  const fieldRef = useRef();

  // State to hold answer object (contains id, answerText and isCorrect)
  const [answer, setAnswer] = useState({
    id: answerNumber,
    answerText: "",
    isCorrect: false,
  });

  const handleCheckBoxChange = (e) => {
    if (e.target.checked) {
      setAnswer({ ...answer, isCorrect: true });
    } else {
      setAnswer({ ...answer, isCorrect: false });
    }
  };

  const handleAnswerTextChange = (e) => {
    setAnswer({ ...answer, answerText: e.target.value });
  };

  const deleteAnswerInputField = () => {
    // Delete the answer object from the savedAnswers array in the parent state so it will not be submitted when the onSubmit is called
    setSavedAnswers((prevAnswers) => {
      return prevAnswers.filter((item) => item.id !== answer.id);
    });

    // Delete this element from the array of AnswerInputFields in the parent element, so it will no longer be rendered
    setAnswerInputFields((prevInputFields) =>
      prevInputFields.filter(
        (field) => field.props.answerNumber !== answerNumber
      )
    );
  };

  // After the answer is updated, update the savedAnswers state of the parent component.
  // If this answer already exists in the savedAnswers state, update it. Otherwise add it to the state
  useEffect(() => {
    setSavedAnswers((prevAnswers) => {
      if (prevAnswers.some((item) => item.id === answer.id)) {
        return prevAnswers.map((obj) => (obj.id === answer.id ? answer : obj));
      } else {
        return [...prevAnswers, answer];
      }
    });
  }, [answer, setSavedAnswers]);

  return (
    <Stack direction="row" width="100%" alignItems="center">
      <Stack justifyContent="center" pt="1rem">
        <Tooltip title="Mark as correct">
          <Checkbox
            color="success"
            name="isCorrect"
            onChange={(e) => handleCheckBoxChange(e)}
          />
        </Tooltip>
      </Stack>
      <TextField
        ref={fieldRef}
        key={answerNumber}
        required
        id={answerNumber.toString()}
        label={`Type Answer`}
        variant="standard"
        name="answerText"
        value={answer.answerText}
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
            onClick={() => deleteAnswerInputField()}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

export default AnswerInputField;
