import { Stack, Paper, Typography, Divider } from "@mui/material";
import paperStyles from "../../../styles/paperStyles";
import QuizIcon from "@mui/icons-material/Quiz";
import QuizCreationForm from "../../forms/QuizCreationForm";

function QuizCreationPage() {
  return (
    <Stack>
      <Stack p="1rem" direction="row">
        <Stack justifyContent="center">
          <QuizIcon />
        </Stack>

        <Typography component="h1" variant="h5" align="left" pl="0.5rem">
          <b>{"Create a new Quiz"}</b>
        </Typography>
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
        <QuizCreationForm />
      </Paper>
    </Stack>
  );
}

export default QuizCreationPage;
