import { useEffect, useState } from "react";
import {
  List,
  ListItem,
  Stack,
  Typography,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Divider,
} from "@mui/material";

function QuizQuestion({ question, questionNumber, setQuizAttempt, socket }) {
  const { question_id, content: questionText, answers: answerList } = question;

  // Object containing the question_id and an array of answers objects
  const [questionAttempt, setQuestionAttempt] = useState({
    id: question_id,
    answers: answerList.map((answer) => ({
      answer_id: answer.answer_id,
      isChosen: false,
    })),
  });

  const handleToggle = (answerID) => {
    setQuestionAttempt((prevAttempt) => {
      const updatedAnswers = prevAttempt.answers.map((answer) => {
        if (answer.answer_id === answerID) {
          return { ...answer, isChosen: !answer.isChosen };
        }
        return answer;
      });

      return { ...prevAttempt, answers: updatedAnswers };
    });
  };

  useEffect(() => {
    // When the questionAttempt changes (an answer is selected/deselected), update the quizAttempt parent state.
    // If this questionAttempt object is already in the quizAttempt, update it with the new answer selection. If not, add it
    setQuizAttempt((prevAttempt) => {
      if (prevAttempt.some((obj) => obj.id === questionAttempt.id)) {
        return prevAttempt.map((obj) =>
          obj.id === questionAttempt.id ? questionAttempt : obj
        );
      } else {
        return [...prevAttempt, questionAttempt];
      }
    });
  }, [questionAttempt, setQuizAttempt]);

  return (
    <Stack mt="0.5rem">
      <Typography
        variant="h5"
        ml="1rem"
      >{`${questionNumber}. ${questionText}`}</Typography>
      <List>
        {answerList.map((answer, index) => {
          const { answer_id, content: answerText, is_correct } = answer;
          const isChecked =
            questionAttempt.answers.find((a) => a.answer_id === answer_id)
              ?.isChosen || false;
          return (
            <ListItem key={index} dense>
              <ListItemButton dense onClick={() => handleToggle(answer_id)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={isChecked} // Box is checked if the answer object in the array of answers is set as chosen
                    onChange={async (e) => {
                      await socket.emit("new-answer", {
                        socketID: socket.id,
                        questionIndex: (questionNumber - 1),
                        isCorrect: (is_correct && e.target.checked) ? true : (!is_correct && e.target.checked) ? false : null
                      });
                    }}
                  />
                </ListItemIcon>
                <ListItemText primary={answerText} />
              </ListItemButton>
            </ListItem>
          );
        })}
        <Divider sx={{ width: "100%" }} />
      </List>
      <Divider sx={{ width: "100%" }} />
    </Stack>
  );
}

export default QuizQuestion;
