import ChatBox from "../chat/ChatBox";
import { useParams, useLocation, Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import {
  Stack,
  Typography,
  Divider,
  Paper,
  Snackbar,
  Alert,
  Fab,
  useMediaQuery,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import Error404Page from "./Error404Page";
import paperStyles from "../../styles/paperStyles";
import { AuthContext } from "../authentication/AuthProvider";
import LoadingSpinnerPage from "./LoadingSpinnerPage";

function ChatRoomPage() {
  const smallScreen = useMediaQuery("(max-width:600px)")
  const location = useLocation();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // On first render, check if a success message was passed from the previous page
    // If so, save it in the 'succcessMessage' state, then set the 'showSuccessMessage' state to true so it will be displayed
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setShowSuccessMessage(true);
      window.history.replaceState(null, ""); // Clear the history state after the message is retrieved so it does not re-appear on page refresh
    }
  }, [location]);

  // Display Loading animation while API call is in progress
  if (loading) {
    return <LoadingSpinnerPage />;
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

        <Stack direction="row" justifyContent="space-between" flexGrow={1}>
          <Stack pl="0.5rem" justifyContent="center">
            <Typography
              component="h1"
              variant="h5"
              align="left"
              display="flex"
              alignItems="center"
            >
              <b>{room.title}</b>
            </Typography>

            {/* Display room description on larger screens if one exists */}
            {(!smallScreen && room.description) && (
              <Typography variant="body2" color="text.secondary">
                {room.description}
              </Typography>
            )}
          </Stack>

          {/* If the room owner is viewing the page, render the 'Add Users' button */}
          {user.id === room.member_id && (
            <Link
              style={{ textDecoration: "none", color: "white" }}
              to={`/chats/${roomID}/enrol`}
            >
              <Fab color="success" variant="extended">
                <Typography fontSize="md">Add Users</Typography>
                <AddIcon />
              </Fab>
            </Link>
          )}
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
          backgroundColor:
            theme.palette.mode === "light" && theme.palette.grey[100],
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
