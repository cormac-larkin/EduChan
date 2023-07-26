import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";
import AbcIcon from "@mui/icons-material/Abc";
import DescriptionIcon from "@mui/icons-material/Description";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function QuizCreationForm() {
  const navigate = useNavigate();

  // States to hold form inputs
  const [quizName, setQuizName] = useState("");
  const [description, setDescription] = useState("");

  // States for handling API error messages
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure no empty inputs are submitted
    if (quizName.startsWith(" ")) {
      alert("Quiz Name must not begin with a whitespace");
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/quizzes/",
        {
          quizName,
          description: description || null,
        },
        { withCredentials: true }
      );
      const newQuizID = response?.data?.quizID;
      navigate(`/quizzes/${newQuizID}/edit`, {
        state: {
          message: `Quiz created successfully!`, // Pass success message to the ChatRoomPage so we can display notification upon redirect
        },
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error?.response?.data?.error || "Error: Unable to create quiz"
      );
      setShowErrorMessage(true);
    }
  };

  return (
    <>
      <Typography
        component="h1"
        variant="h4"
        align="center"
        paddingBottom="1rem"
      >
        New Quiz
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="quizName"
          label="Quiz Name"
          name="quizName"
          type="text"
          autoFocus
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AbcIcon />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          margin="normal"
          fullWidth
          id="description"
          label="Description (Optional)"
          name="description"
          type="text"
          autoFocus
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DescriptionIcon />
              </InputAdornment>
            ),
          }}
          inputProps={{ maxLength: 100 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Create Quiz
        </Button>
      </Box>

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
    </>
  );
}

export default QuizCreationForm;
