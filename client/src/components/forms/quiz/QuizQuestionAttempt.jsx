import {
  Stack,
  Typography,
  ListItem,
  Divider,
  List,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Checkbox,
} from "@mui/material";
import DangerousIcon from "@mui/icons-material/Dangerous";
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { useTheme } from "@emotion/react";

function QuizQuestionAttempt({ questionNumber, question }) {
  const theme = useTheme();
  const { content: questionText, answers: answerList } = question;

  return (
    <Stack mt="0.5rem" width="100%">
      <Typography
        variant="h5"
        ml="1rem"
      >{`${questionNumber}. ${questionText}`}</Typography>
      <List>
        {answerList.map((answer, index) => {
          const { content: answerText, is_correct, was_selected } = answer;
          return (
            <>
              {/* Show green tick icon if answer is correct and was selected */}
              {is_correct && was_selected && (
                <ListItem key={index} dense>
                  <ListItemButton dense  sx={{backgroundColor: theme.palette.mode === "light" ? "#bbfcbb" : "#203b20", borderRadius: "5px"}}>
                    <ListItemIcon >
                      <Checkbox edge="start" checked={true} color="success"  />
                    </ListItemIcon>
                    <ListItemText primary={answerText} secondary={"Correct!"} />
                  </ListItemButton>
                </ListItem>
              )}
              {/* Show red 'X' icon if answer is not correct and was selected */}
              {!is_correct && was_selected && (
                <ListItem key={index} dense>
                  <ListItemButton dense sx={{backgroundColor: theme.palette.mode === "light" ? "#fcbbbb" : "#3b2120", borderRadius: "5px"}}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={true}
                        color="error"
                        checkedIcon={<DangerousIcon />}
                      />
                    </ListItemIcon>
                    <ListItemText primary={answerText} secondary={"Wrong choice!"}/>
                  </ListItemButton>
                </ListItem>
              )}
              {/* Show yellow attention icon if answer is correct and was not selected */}
              {is_correct && !was_selected && (
                <ListItem key={index} dense>
                  <ListItemButton dense sx={{backgroundColor: theme.palette.mode === "light" ? "#fcf0bb" : "#3b3720", borderRadius: "5px"}}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={true}
                        color="warning"
                        checkedIcon={<PriorityHighIcon />}
                      />
                    </ListItemIcon>
                    <ListItemText primary={answerText} secondary={"You missed this one!"}/>
                  </ListItemButton>
                </ListItem>
              )}
              {/* Show no icon if answer is not correct and was not selected */}
              {!is_correct && !was_selected && (
                <ListItem key={index} dense>
                  <ListItemButton dense>
                    <ListItemIcon>
                      <Checkbox edge="start" checked={false} color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={answerText} />
                  </ListItemButton>
                </ListItem>
              )}
            </>
          );
        })}
        <Divider sx={{ width: "100%" }} />
      </List>
      <Divider sx={{ width: "100%" }} />
    </Stack>
  );
}

export default QuizQuestionAttempt;
