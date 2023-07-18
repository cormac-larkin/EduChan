import ChatBox from "../chat/ChatBox";
import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThreeCircles } from "react-loader-spinner";
import {
  Stack,
  Typography,
  Divider,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import axios from "axios";
import Error404Page from "./Error404Page";
import paperStyles from "../../styles/paperStyles";

function ChatRoomPage() {
  const location = useLocation();
  const { roomID } = useParams(); // Get the room ID from the URL

  const [room, setRoom] = useState();
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  /**
   * Retrieves the details of the chat room from the API and sets the 'room' state.
   */
  const fetchRoom = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/chats/${roomID}`,
        {
          withCredentials: true,
        }
      );
      setRoom(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setRoom(null);
      console.error(error);
    }
  };

  // Fetch room data from the API on first render
  useEffect(() => {
    fetchRoom();
  }, []);

  useEffect(() => {
    // On first render, check if a success message was passed from the previous page
    // If so, save it in the 'succcessMessage' state, then set the 'showSuccessMessage' state to true so it will be displayed
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setShowSuccessMessage(true);
      window.history.replaceState(null, ""); // Clear the history state after the message is retrieved
    }
  }, [location]);

  // Display Loading animation while API call is in progress
  if (loading) {
    return <ThreeCircles />;
  }

  // If no room with the specified ID is found, render the 404 Error Page
  if (room === null) {
    return <Error404Page />;
  }

  return (
    <Stack>
      <Stack p="1rem" direction="row">
        <Stack justifyContent="center">
          <ChatIcon />
        </Stack>

        <Typography component="h1" variant="h5" align="left" pl="0.5rem">
          <b>{room.title}</b>
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
        <ChatBox room={room} />
      </Paper>

      {/* Success Message Notification if redirected from ChatCreationPage */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowSuccessMessage(false)}
        message={successMessage}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={() => setShowSuccessMessage(false)}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default ChatRoomPage;
