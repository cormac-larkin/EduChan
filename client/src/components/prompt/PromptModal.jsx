import {
  Modal,
  Fade,
  Box,
  Typography,
  FormControl,
  TextField,
  Button,
  Backdrop,
  InputAdornment,
} from "@mui/material";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { useContext, useState } from "react";
import { AuthContext } from "../authentication/AuthProvider";
import axios from "axios";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function PromptModal({
  promptModalOpen,
  setPromptModalOpen,
  fetchMessages,
  socket,
  room,
}) {
  const { user } = useContext(AuthContext);

  const [promptText, setPromptText] = useState("");

  const handleClose = () => {
    setPromptModalOpen(false);
  };

  const postPrompt = async (e) => {
    e.preventDefault();
    if (!promptText || promptText.startsWith(" ")) {
      alert("Prompt text must not be empty or begin with a whitespace");
      return;
    }

    try {
      // Create the prompt in the DB and get its promptID
      const response = await axios.post(
        "http://localhost:5000/prompts",
        { content: promptText, roomID: room.room_id },
        { withCredentials: true }
      );
      const newPromptID = response?.data?.promptID;

      // Post a message with the new promptID linked to it
      await axios.post(
        `http://localhost:5000/chats/${room.room_id}/messages`,
        {
          content: promptText,
          authorID: user.id,
          parent_id: null,
          promptID: newPromptID,
        },
        { withCredentials: true }
      );
      // Emit 'send-message' event to WS server and fetch latest messages from the API
      // The chat server will emit the 'receive' message event which will cause all other clients to refresh their messages
      await socket.emit("send-message", room.title);
      fetchMessages();
      setPromptText("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Modal
        aria-labelledby="quiz-selector-modal"
        aria-describedby="select the quiz to launch in the chatroom"
        open={promptModalOpen}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={promptModalOpen}>
          <Box
            component="form"
            sx={{ ...style, maxWidth: "95vw", borderRadius: "5px" }}
            onSubmit={(event) => {
              postPrompt(event);
              handleClose();
            }}
          >
            <Typography
              id="transition-modal-title"
              variant="h6"
              component="h2"
              mb="1rem"
            >
              Create a Prompt
            </Typography>
            <FormControl fullWidth>
              <TextField
                margin="normal"
                required
                fullWidth
                name="prompt"
                label="Prompt Text"
                type="text"
                id="prompt"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                inputProps={{
                  minLength: 1,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PlaylistAddIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Post
            </Button>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}

export default PromptModal;
