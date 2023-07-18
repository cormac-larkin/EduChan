import { useState } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  TextField,
  InputAdornment,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import AbcIcon from "@mui/icons-material/Abc";
import { useNavigate } from "react-router-dom";

function ChatCreationForm() {
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const handleRoomNameChange = (e) => {
    const value = e.target.value;

    setRoomName(value);
  };

  /**
   * Handles form submission to create a new chat room via the API.
   *
   * @param {Event} event - The form submission event.
   * @returns {Promise<void>} - A Promise that resolves after handling the form submission.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/chats/",
        { roomName },
        {
          withCredentials: true,
        }
      );
      const newRoomId = response?.data?.room?.room_id;
      console.log(response);
      navigate(`/chats/${newRoomId}`, {
        state: {
          message: `Room created successfully!`, // Pass success message to the ChatRoomPage so we can display notification upon redirect
        },
      });
    } catch (error) {
      setError(
        error?.response?.data?.error || "Error: Unable to create chat room"
      );
      setShowAlert(true);
      console.error(error);
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
        New Chat Room
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="roomName"
          label="Room Name"
          name="roomName"
          type="text"
          autoFocus
          value={roomName}
          onChange={(e) => handleRoomNameChange(e)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AbcIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Create Room
        </Button>
      </Box>
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
      >
        <Alert
          severity="error"
          sx={{ width: "100%" }}
          onClose={() => setShowAlert(false)}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ChatCreationForm;
