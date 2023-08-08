import {
  Stack,
  Divider,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Checkbox,
  LinearProgress,
  Box,
} from "@mui/material";
import paperStyles from "../../../styles/paperStyles";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function QuizReportPage({embeddedQuizID}) {

  let { quizID } = useParams();

  // If this page is embedded inside a chat message, use the embededdQuizID prop instead of the URL paramater to get the quizID
  if(!quizID) {
    quizID = embeddedQuizID;
  }


  // An array of question objects for the specified quiz, containing data on the number of users who answered each question correctly
  const [questionReports, setQuestionReports] = useState([]);

  const fetchQuizReport = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/quizzes/${quizID}/report`,
        { withCredentials: true }
      );
      setQuestionReports(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchQuizReport();
  }, []);

  return (
    <Stack>
      <Stack p="1rem" direction="row">
        <Stack justifyContent="center">
          <SummarizeIcon />
        </Stack>
        <Stack pl="0.5rem">
          <Typography component="h1" variant="h5" align="left">
            <b>{`Quiz Report: ${questionReports[0]?.quiz_title || "N/A"}`}</b>
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
        {questionReports.length ? questionReports.map((question, index) => (
          <Stack key={index} width="100%" m={"1rem"} ml={"2rem"}>
            <Typography variant="h5" width="100%" mb="0.5rem">{`${index + 1}. ${
              question.question_content
            }`}</Typography>
            <Stack direction="column" pl={"1.7rem"} mb="1rem">
              <Typography color="text.secondary">
                {`${question.percentage_fully_correct}% of Students answered correctly`}
              </Typography>
              <Box width="80%">
                <LinearProgress
                  variant="determinate"
                  value={question.percentage_fully_correct}
                  color={
                    question.percentage_fully_correct > 70 ? "info" : "warning"
                  }
                />
              </Box>
            </Stack>

            {question.answers.map((answer) => (
              <List key={answer.answer_id} dense sx={{ padding: 0 }}>
                <ListItemButton dense>
                  <ListItemIcon>
                    <Checkbox checked={answer.is_correct} color="success" />
                  </ListItemIcon>
                  <ListItemText primary={answer.content} />
                </ListItemButton>
                <Divider />
              </List>
            ))}
            <Divider sx={{ pt: "1rem" }} />
          </Stack>
        )) : "No answers have been submitted for this quiz..."}
      </Paper>
    </Stack>
  );
}

export default QuizReportPage;
