import {
  Grid,
  Button,
  Dialog,
  Snackbar,
  Alert,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { useEffect, useState } from "react";
import ChatCard from "./ChatCard";

function CardContainer({ chats, onChatDelete, error }) {
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [chatToDelete, setChatToDelete] = useState({});
  const [confirmationInput, setConfirmationInput] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

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
    onChatDelete(chatToDelete.room_id);
    setShowConfirmationDialog(false);
    setShowSuccessMessage(true);
    setConfirmationInput("");
  };

  useEffect(() => {
    if (error) {
      setShowErrorMessage(true);
    }
  }, [error]);

  return (
    <Grid
      container
      spacing={{ xs: 2, md: 3 }}
      columns={{ xs: 4, sm: 8, md: 12 }}
    >
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

      {/* Error notification if API call in Parent Component fails */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showErrorMessage}
        autoHideDuration={6000}
        message={error}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>

      {chats.map((chat) => (
        <Grid item xs={2} sm={4} md={4} key={chat.room_id}>
          <ChatCard chat={chat} onDeleteSelection={handleDeleteSelection} />
        </Grid>
      ))}
    </Grid>
  );
}

export default CardContainer;
