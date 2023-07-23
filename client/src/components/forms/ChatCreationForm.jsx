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
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import { useNavigate } from "react-router-dom";

function ChatCreationForm() {
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");

  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const handleRoomNameChange = (e) => {
    const value = e.target.value;

    setRoomName(value);
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;

    setDescription(value);
  };

  const handleImageURLChange = (e) => {
    const value = e.target.value;

    setImageURL(value);
  };

  /**
   * Handles form submission to create a new chat room via the API.
   *
   * @param {Event} event - The form submission event.
   * @returns {Promise<void>} - A Promise that resolves after handling the form submission.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate inputs
    if (
      roomName.startsWith(" ") ||
      description.startsWith(" ") ||
      imageURL.startsWith(" ")
    ) {
      alert("Form values may not begin with a whitespace");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/chats/",
        {
          roomName: roomName,
          description: description || null,
          imageURL: imageURL || null
        },
        {
          withCredentials: true,
        }
      );
      const newRoomID = response?.data?.room?.room_id;
      console.log(response);
      navigate(`/chats/${newRoomID}`, {
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

        <TextField
          margin="normal"
          fullWidth
          id="description"
          label="Description (Optional)"
          name="description"
          type="text"
          autoFocus
          value={description}
          onChange={(e) => handleDescriptionChange(e)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DescriptionIcon />
              </InputAdornment>
            ),
          }}
          inputProps={{maxLength: 100}}
        />

        <TextField
          margin="normal"
          fullWidth
          id="imageURL"
          label="Image URL (Optional)"
          name="imageURL"
          type="text"
          autoFocus
          value={imageURL}
          onChange={(e) => handleImageURLChange(e)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ImageIcon />
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

      {/* Error notification if API call fails */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
