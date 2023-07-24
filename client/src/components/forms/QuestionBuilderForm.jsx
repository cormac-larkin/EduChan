import {
  Accordion,
  AccordionSummary,
  Typography,
  Box,
  InputAdornment,
  TextField,
  Slider
} from "@mui/material";
import paperStyles from "../../styles/paperStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { useState } from "react";

function QuestionBuilderForm({ questionNumber }) {

  const [numberOfAnswers, setNumberOfAnswers] = useState(0);
  const [answers, setAnswers] = useState([]);

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
        <Box component="form">
          <TextField
            margin="normal"
            required
            fullWidth
            id="questionText"
            label="Question Text"
            name="questionText"
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
        </Box>
      </Accordion>
    </>
  );
}

export default QuestionBuilderForm;
