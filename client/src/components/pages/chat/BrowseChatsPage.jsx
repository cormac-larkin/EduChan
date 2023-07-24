import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../authentication/AuthProvider";

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
import ChatCard from "../../UI/ChatCard";
import paperStyles from "../../../styles/paperStyles";

function BrowseChatsPage() {
  const { user } = useContext(AuthContext);

  // States for holding chats fetched from the API
  const [ownedChats, setOwnedChats] = useState([]);
  const [joinedChats, setJoinedChats] = useState([]);

  // States for handling chat room deletion
  const [chatToDelete, setChatToDelete] = useState({});
  const [showDeleteConfirmationDialog, setShowDeleteConfirmationDialog] =
    useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [showDeletionSuccessMessage, setShowDeletionSuccessMessage] =
    useState(false);

  // States for handling hiding of chat rooms
  const [roomToHide, setRoomToHide] = useState({});
  const [showRoomHideDialog, setShowRoomHideDialog] = useState(false);
  const [showRoomHideSuccessMessage, setShowRoomHideSuccessMessage] =
    useState(false);

  // States for handling un-hiding of chat rooms
  const [roomToUnhide, setRoomToUnhide] = useState({});
  const [showRoomUnhideDialog, setShowRoomUnhideDialog] = useState(false);
  const [showRoomUnhideSuccessMessage, setShowRoomUnhideSuccessMessage] =
    useState(false);

  // States for controlling opening/closing of 'Accordion' UI elements
  const [expandFirstAccordion, setExpandFirstAccordion] = useState(true);
  const [expandSecondAccordion, setExpandSecondAccordion] = useState(true);

  // States for handling API errors
  const [error, setError] = useState(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  /**
   * Handles the users choice to delete a Chat Room. Stores the chat object in the 'chatToDelete' state, then opens a confirmation dialog.
   *
   * @param {Object} chat - The chat room the user has selected for deletion
   *
   */
  const handleDeleteSelection = (chat) => {
    setChatToDelete(chat);
    setShowDeleteConfirmationDialog(true);
  };

  /**
   * Handles the users confirmation that they wish to delete a Chat Room. The chat room is deleted and the confirmation dialog box is closed.
   */
  const handleDeleteConfirmation = () => {
    // Ensure the user has correctly typed the Chat Room name in the confirmation dialog
    if (deleteConfirmationInput !== chatToDelete.title) {
      return;
    }
    handleChatDeletion(chatToDelete.room_id);
    setShowDeleteConfirmationDialog(false);
    setShowDeletionSuccessMessage(true);
    setDeleteConfirmationInput("");
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
      console.error(error);
    }
  };

  const handleHideSelection = (roomToHide) => {
    setRoomToHide(roomToHide);
    setShowRoomHideDialog(true);
  };

  const hideChat = async (chat) => {
    try {
      await axios.put(
        `http://localhost:5000/chats/${chat.room_id}/hide`,
        {},
        {
          withCredentials: true,
        }
      );
      setShowRoomHideSuccessMessage(true);
      fetchOwnedChats();
    } catch (error) {
      setError(
        error?.response?.data?.error || "Error: Unable to hide the chat room"
      );
      setShowErrorMessage(true);
      console.log(error);
    }
  };

  const handleUnhideSelection = (roomToUnhide) => {
    setRoomToUnhide(roomToUnhide);
    setShowRoomUnhideDialog(true);
  };

  const unHideChat = async (chat) => {
    try {
      await axios.put(
        `http://localhost:5000/chats/${chat.room_id}/show`,
        {},
        {
          withCredentials: true,
        }
      );
      setShowRoomUnhideSuccessMessage(true);
      fetchOwnedChats();
    } catch (error) {
      setError(
        error?.response?.data?.error || "Error: Unable to un-hide the chat room"
      );
      setShowErrorMessage(true);
      console.log(error);
    }
  };

  // On first render, fetch all the User's chats from the database.
  // If the User is a Teacher, fetch the chats that they own, as well as chats that they have joined.
  useEffect(() => {
    if (user?.isTeacher) {
      fetchOwnedChats();
    }

    fetchJoinedChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            sx={{ borderBottom: "1px solid grey" }}
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
                  onHideSelection={handleHideSelection}
                  onUnhideSelection={handleUnhideSelection}
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
          sx={{ borderBottom: "1px solid grey" }}
        >
          <Typography
            sx={{ width: "75%", flexShrink: 0 }}
            component="h1"
            variant="h5"
          >
            {/* Display the number of joined chats, minus any hidden/archived chats */}
            {`Joined Chat Rooms (${joinedChats.length && (joinedChats.length - joinedChats.reduce((count, chat) => count + (chat.hidden ? 1 : 0), 0))})`}
          </Typography>
        </AccordionSummary>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          pt="1rem"
        >
          {joinedChats.map((chat, index) =>
            !chat.hidden ? (
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
            ) : null
          )}
        </Grid>
      </Accordion>

      {/* Confirmation dialog for chat deletion */}
      <Dialog
        open={showDeleteConfirmationDialog}
        onClose={() => {
          setShowDeleteConfirmationDialog(false);
          setDeleteConfirmationInput("");
        }}
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
          value={deleteConfirmationInput}
          onChange={(e) => setDeleteConfirmationInput(e.target.value)}
          fullWidth
          variant="standard"
          sx={{ margin: "0.5rem", maxWidth: "calc(100% - 1rem)" }}
        />
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirmationDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirmation} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation dialog for archiving room */}
      <Dialog
        open={showRoomHideDialog}
        onClose={() => setShowRoomHideDialog(false)}
        sx={{ paddingLeft: "0.5rem" }}
      >
        <DialogTitle sx={{ paddingLeft: "0.5rem" }}>
        {`Archive '${roomToHide.title}'?`}
        </DialogTitle>
        <DialogContentText paddingLeft="0.5rem">
          {`Are you sure you want to archive the '${roomToHide.title}' chat room? The room will be hidden from all other users. You may re-activate the room later.`}
        </DialogContentText>
        <DialogActions>
          <Button onClick={() => setShowRoomHideDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              hideChat(roomToHide);
              setShowRoomHideDialog(false);
            }}
            color="error"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation dialog for message un-hiding */}
      <Dialog
        open={showRoomUnhideDialog}
        onClose={() => setShowRoomUnhideDialog(false)}
        sx={{ paddingLeft: "0.5rem", whiteSpace: "pre-wrap" }}
      >
        <DialogTitle sx={{ paddingLeft: "0.5rem" }}>
          {`Reactivate '${roomToUnhide.title}'?`}
        </DialogTitle>
        <DialogContentText paddingLeft="0.5rem">
          {`Are you sure you want to reactivate the '${roomToUnhide.title}' chat room? The room will be visible to all enrolled users. You may archive the room again later.`}
        </DialogContentText>
        <DialogActions>
          <Button onClick={() => setShowRoomUnhideDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              unHideChat(roomToUnhide);
              setShowRoomUnhideDialog(false);
            }}
            color="error"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success notification upon chat deletion */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showDeletionSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowDeletionSuccessMessage(false)}
        message={"Chat Deleted Successfully!"}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={() => setShowDeletionSuccessMessage(false)}
        >
          {"Chat Deleted Successfully!"}
        </Alert>
      </Snackbar>

       {/* Success notification upon chat hide/archive */}
       <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showRoomHideSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowRoomHideSuccessMessage(false)}
        message={"Chat Archived Successfully!"}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={() => setShowRoomHideSuccessMessage(false)}
        >
          {"Chat Archived Successfully!"}
        </Alert>
      </Snackbar>

       {/* Success notification upon chat re-activation/unhide */}
       <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showRoomUnhideSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowRoomUnhideSuccessMessage(false)}
        message={"Chat Reactivated Successfully!"}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={() => setShowRoomUnhideSuccessMessage(false)}
        >
          {"Chat Reactivated Successfully!"}
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
