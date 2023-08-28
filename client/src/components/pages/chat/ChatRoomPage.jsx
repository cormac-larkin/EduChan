import ChatBox from "../../chat/ChatBox";
import { useParams, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import {
  Stack,
  Typography,
  Divider,
  Paper,
  Snackbar,
  Alert,
  Chip,
  useMediaQuery,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import axios from "axios";
import Error404Page from "../error/Error404Page";
import paperStyles from "../../../styles/paperStyles";
import { AuthContext } from "../../authentication/AuthProvider";
import LoadingSpinnerPage from "../error/LoadingSpinnerPage";
import ChatPageKebabMenu from "../../UI/ChatPageKebabMenu";

function ChatRoomPage() {
  const smallScreen = useMediaQuery("(max-width:600px)");
  const location = useLocation();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const { roomID } = useParams(); // Get the room ID from the URL

  const [room, setRoom] = useState();
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // State for controlling the LiveQuizSelectorModal
  const [selectorModalOpen, setSelectorModalOpen] = useState(false); // setter function passed as props to ChatPageKebabMenu

  // State for controlling the Prompt Modal
  const [promptModalOpen, setPromptModalOpen] = useState(false); // setter function passed as props to ChatPageKebabMenu

  // State for controlling the QR Code Modal
  const [QRCodeModalOpen, setQRCodeModalOpen] = useState(false); // setter function passed as props to ChatPageKebabMenu

  // Dummy State passed to the ChatPageKebabMenu so that we can force a re-render of this component when the room is set/unset as read-only
  const [readOnly, setReadOnly] = useState();

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
  }, [readOnly]);

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
            <Stack
              direction={smallScreen ? "column" : "row"}
              alignItems={smallScreen ? "flex-start" : "center"}
            >
              <Typography
                component="h1"
                variant="h5"
                align="left"
                display="flex"
                alignItems="center"
              >
                <b>{room.title}</b>
              </Typography>

              {room.read_only && (
                <Chip
                  color="warning"
                  variant="outlined"
                  size="small"
                  label="Read Only"
                  sx={{ width: "6rem", marginLeft: !smallScreen && "0.3rem" }}
                />
              )}
            </Stack>

            {/* Display room description on larger screens if one exists */}
            {!smallScreen && room.description && (
              <Typography variant="body2" color="text.secondary">
                {room.description}
              </Typography>
            )}
          </Stack>

          {/* If the room owner is viewing the page, render the 'Kebab Menu' button */}
          {user.id === room.member_id && (
            <ChatPageKebabMenu
              room={room}
              onReadOnlyChange={setReadOnly}
              setSelectorModalOpen={setSelectorModalOpen}
              setPromptModalOpen={setPromptModalOpen}
              setQRCodeModalOpen={setQRCodeModalOpen}
            />
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
        <ChatBox
          room={room}
          selectorModalOpen={selectorModalOpen}
          setSelectorModalOpen={setSelectorModalOpen}
          promptModalOpen={promptModalOpen}
          setPromptModalOpen={setPromptModalOpen}
          QRCodeModalOpen={QRCodeModalOpen}
          setQRCodeModalOpen={setQRCodeModalOpen}
        />
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
