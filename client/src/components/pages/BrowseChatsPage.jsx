import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../authentication/AuthProvider";

import {
  Grid,
  Stack,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
} from "@mui/material";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChatCard from "../UI/ChatCard";
import paperStyles from "../../styles/paperStyles";

function BrowseChatsPage() {
  const { user } = useContext(AuthContext);

  const [ownedChats, setOwnedChats] = useState([]);
  const [joinedChats, setJoinedChats] = useState([]);
  const [error, setError] = useState(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [chatToDelete, setChatToDelete] = useState({});
  const [confirmationInput, setConfirmationInput] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [expandFirstAccordion, setExpandFirstAccordion] = useState(true);
  const [expandSecondAccordion, setExpandSecondAccordion] = useState(true);

  /**
   * Handles the users choice to delete a Chat Room. Stores the chat object in the 'chatToDelete' state, then opens a confirmation dialog.
   *
   * @param {Object} chat - The chat room the user has selected for deletion
   *
   */
  const handleDeleteSelection = (chat) => {
    setChatToDelete(chat);
    setShowConfirmationDialog(true);
  };

  /**
   * Handles the users confirmation that they wish to delete a Chat Room. The chat room is deleted and the confirmation dialog box is closed.
   */
  const handleDeleteConfirmation = () => {
    // Ensure the user has correctly typed the Chat Room name in the confirmation dialog
    if (confirmationInput !== chatToDelete.title) {
      return;
    }
    handleChatDeletion(chatToDelete.room_id);
    setShowConfirmationDialog(false);
    setShowSuccessMessage(true);
    setConfirmationInput("");
  };

  /**
   * Sends a GET request to the API to retrieve all chats owned by a User.
   * Updates the 'chats' state with the latest data returned by the API.
   */
  const fetchOwnedChats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/users/${user.id}/chats/owned`,
        {
          withCredentials: true,
        }
      );
      setOwnedChats(response.data);
    } catch (error) {
      setError(
        error?.response?.data?.error ||
          "Error: Unable to retrieve your owned chats"
      );
      setShowErrorMessage(true);
      console.error(error);
    }
  };

  /**
   * Sends a GET request to the API to retrieve all chats joined by a User.
   * Updates the 'chats' state with the latest data returned by the API.
   */
  const fetchJoinedChats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/users/${user.id}/chats/joined`,
        {
          withCredentials: true,
        }
      );
      setJoinedChats(response.data);
    } catch (error) {
      setError(
        error?.response?.data?.error ||
          "Error: Unable to retrieve your joined chats"
      );
      setShowErrorMessage(true);
      console.error(error);
    }
  };

  /**
   * Sends a DELETE request to the API to delete a specific chatroom
   *
   * @param {Number} roomID - The room_id of the chatroom to delete
   */
  const handleChatDeletion = async (roomID) => {
    try {
      await axios.delete(`http://localhost:5000/chats/${roomID}`, {
        withCredentials: true,
      });
      fetchOwnedChats();
    } catch (error) {
      setError(
        error?.response?.data?.error || "Error: Unable to delete the chat room"
      );
      setShowErrorMessage(true);
      console.error(error.response.data.error);
    }
  };

  // On first render, fetch all the User's chats from the database.
  // If the User is a Teacher, fetch the chats that they own, as well as chats that they have joined.
  useEffect(() => {
    if (user?.isTeacher) {
      fetchOwnedChats();
    }

    fetchJoinedChats();
  }, []);

  return (
    <Stack>
      <Stack p="1rem" direction="row">
        <Stack justifyContent="center">
          <ForumRoundedIcon />
        </Stack>
        <Typography component="h1" variant="h5" align="left" pl="0.5rem">
          <b>Browse Chat Rooms</b>
        </Typography>
      </Stack>
      <Divider />
      {user?.isTeacher && (
        <Accordion
          elevation={6}
          expanded={expandFirstAccordion}
          onChange={() => setExpandFirstAccordion((prevState) => !prevState)}
          disableGutters
          sx={{ ...paperStyles, borderRadius: "5px" }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography
              sx={{ width: "75%", flexShrink: 0 }}
              component="h1"
              variant="h5"
            >
              {`Created Chat Rooms (${ownedChats.length})`}
            </Typography>
          </AccordionSummary>
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
            pt="1rem"
          >
            {ownedChats.map((chat, index) => (
              <Grid
                item
                xs={2}
                sm={4}
                md={4}
                key={index}
                display={"flex"}
                justifyContent={"center"}
              >
                <ChatCard
                  chat={chat}
                  onDeleteSelection={handleDeleteSelection}
                />
              </Grid>
            ))}
          </Grid>
        </Accordion>
      )}

      <Accordion
        elevation={6}
        disableGutters
        expanded={expandSecondAccordion}
          onChange={() => setExpandSecondAccordion((prevState) => !prevState)}
        sx={{ ...paperStyles, borderRadius: "5px" }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography
            sx={{ width: "75%", flexShrink: 0 }}
            component="h1"
            variant="h5"
          >
            {`Joined Chat Rooms (${joinedChats.length})`}
          </Typography>
        </AccordionSummary>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          pt="1rem"
        >
          {joinedChats.map((chat, index) => (
            <Grid
              item
              xs={2}
              sm={4}
              md={4}
              key={index}
              display={"flex"}
              justifyContent={"center"}
            >
              <ChatCard chat={chat} onDeleteSelection={handleDeleteSelection} />
            </Grid>
          ))}
        </Grid>
      </Accordion>

      {/* Confirmation dialog for chat deletion */}
      <Dialog
        open={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        sx={{ paddingLeft: "0.5rem" }}
      >
        <DialogTitle sx={{ paddingLeft: "0.5rem" }}>
          Confirm Chat Room Deletion
        </DialogTitle>
        <DialogContentText paddingLeft="0.5rem">
          {`Are you sure you want to delete the '${chatToDelete.title}' Chat Room? Once deleted, this Chat
          Room and all it's messages will be gone forever!`}
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="confirmDeletion"
          label={`Type '${chatToDelete.title}' and click 'Delete' to permanently delete this Chat Room`}
          type="text"
          error={true}
          value={confirmationInput}
          onChange={(e) => setConfirmationInput(e.target.value)}
          fullWidth
          variant="standard"
          sx={{ margin: "0.5rem", maxWidth: "calc(100% - 1rem)" }}
        />
        <DialogActions>
          <Button onClick={() => setShowConfirmationDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirmation} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success notification upon chat deletion */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowSuccessMessage(false)}
        message={"Chat Deleted Successfully!"}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={() => setShowSuccessMessage(false)}
        >
          {"Chat Deleted Successfully!"}
        </Alert>
      </Snackbar>

      {/* Error notification if an API call fails */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showErrorMessage}
        autoHideDuration={6000}
        onClose={() => setShowErrorMessage(false)}
        message={error}
      >
        <Alert
          severity="error"
          sx={{ width: "100%" }}
          onClose={() => setShowErrorMessage(false)}
        >
          {error}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default BrowseChatsPage;
