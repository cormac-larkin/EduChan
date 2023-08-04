import {
  Typography,
  TextField,
  InputAdornment,
  Box,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import LoadingSpinnerPage from "../pages/error/LoadingSpinnerPage";
import Error404Page from "../pages/error/Error404Page";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useTheme } from "@emotion/react";
import { inputLabelClasses } from "@mui/material/InputLabel";

function StudentPrompt({ promptID, room, socket }) {
  const theme = useTheme();

  // States for handling retrieving the prompt from the API
  const [prompt, setPrompt] = useState();
  const [loading, setLoading] = useState(true);

  // State for handling the input in the response box
  const [responseText, setResponseText] = useState("");

  // States for handling success notification after responding to a prompt
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // States for handling error message for failed API call
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const fetchPrompt = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/prompts/${promptID}`,
        { withCredentials: true }
      );
      setPrompt(response?.data);
      setLoading(false);
    } catch (error) {
      setPrompt(null); // Set prompt as null if it cannot be retrieved
      setLoading(false);
      console.error(error);
    }
  };

  const postResponse = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `http://localhost:5000/prompts/${promptID}/responses`,
        {
          content: responseText,
        },
        { withCredentials: true }
      );
      await socket.emit("prompt-response", room.title)
      setShowSuccessMessage(true);
      setResponseText("");
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.error || "Error: Unable to send response"
      );
      setShowErrorMessage(true);
      setResponseText("");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While API call is in progress, show loading spinner
  if (loading) {
    return <LoadingSpinnerPage />;
  }

  // If prompt cannot be retrieved from the API, show the 404 error page
  if (prompt === null) {
    return <Error404Page />;
  }

  return (
    <>
      <Box
        component="form"
        display="flex"
        flexDirection="column"
        alignItems="center"
        onSubmit={postResponse}
      >
        <Typography variant="h5" mt="1rem" align="center" pb="0.5rem" borderBottom="1px solid black">
          {`Q: ${prompt.content}`}
        </Typography>
        <TextField
          margin="normal"
          required
          fullWidth
          name="prompt"
          label="Response"
          variant="filled"
          type="text"
          id="prompt"
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          inputProps={{
            minLength: 1,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EditNoteIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            backgroundColor:
              theme.palette.mode === "light"
                ? "lightgrey"
                : theme.palette.grey[700],
            color: "black",
            borderRadius: "5px",
          }}
          InputLabelProps={{
            sx: {
              color: "black",
              [`&.${inputLabelClasses.shrink}`]: {
                color: theme.palette.mode === "light" ? "black" : "white",
              },
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 0,
            mb: 2,
            backgroundColor:
              theme.palette.mode === "light"
                ? theme.palette.secondary.light
                : theme.palette.secondary.dark,
            color: "white",
          }}
        >
          Respond
        </Button>
      </Box>

      {/* Success message if response sent successfully  */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowSuccessMessage(false)}
        message={"Response sent successfully!"}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={() => setShowSuccessMessage(false)}
        >
          {"Response sent successfully!"}
        </Alert>
      </Snackbar>

      {/* Error message if API call fails  */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showErrorMessage}
        autoHideDuration={6000}
        onClose={() => setShowErrorMessage(false)}
        message={errorMessage}
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

export default StudentPrompt;
