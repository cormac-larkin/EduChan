import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../authentication/AuthProvider";
import axios from "axios";
import io from "socket.io-client";
import {
  Box,
  Alert,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import Fab from "@mui/material/Fab";
import { useTheme } from "@emotion/react";
import MessageInputBox from "./MessageInputBox";
import formatTimestamp from "../../utils/formatTimestamp";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ReplyIcon from '@mui/icons-material/Reply';

function ChatBox({ room }) {
  const { user } = useContext(AuthContext);
  const chatBox = useRef();
  const cursorPositionRef = useRef(0);
  const theme = useTheme();

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [showDeletionMessage, setShowDeletionMessage] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  /**
   * Handles changes to the message input box
   * 
   * @param {} e - The HTML form change event
   */
  const handleInputChange = (e) => {
    const { value, selectionStart } = e.target;
    setNewMessage(value);
    cursorPositionRef.current = selectionStart;
  };

  /**
   * Handles User replies to a message
   * 
   * @param {Object} message - The message object containing the message being replied to.
   */
  const handleReply = (message) => {
    setNewMessage(`*** Replying to #${message.message_id} ***\n\n`);
    cursorPositionRef.current = 50;
  }

  /**
   * Records the ID of the message that the user wishes to delete, and opens a confirmation dialog. 
   * 
   * @param {String} messageID 
   */
  const handleDeleteSelection = (messageID) => {
    setMessageToDelete(messageID);
    setShowConfirmationDialog(true);
  };

  /**
   * Scrolls to the bottom of the chat
   */
  const scrollToBottom = () => {
    chatBox.current.scrollTop = chatBox.current.scrollHeight;
  };

  /**
   * Fetches the latest messages for this chatroom from the database
   */
  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/chats/${room.room_id}/messages`,
        {
          withCredentials: true,
        }
      );
      setMessages(response.data);
    } catch (error) {
      setError(error.response.data.error);
      console.error(error.response.data.error);
    }
  };

  /**
   * POSTS a message to the REST API and emits a 'send-message' event which tells other clients to refresh their chat.
   */
  const sendMessage = async () => {
    // Ensure empty messages are not sent
    if (newMessage === "" || newMessage.startsWith(" ")) {
      return;
    }

    const messageData = {
      authorID: user.id,
      content: newMessage,
    };

    // POST the message to the API
    try {
      await axios.post(
        `http://localhost:5000/chats/${room.room_id}/messages`,
        messageData,
        {
          withCredentials: true,
        }
      );
      // Emit 'send-message' event to WS server and fetch latest messages from the API
      // The chat server will emit the 'receive' message event which will cause all other clients to refresh their messages
      await socket.emit("send-message", messageData);
      fetchMessages();
      setNewMessage(""); // Clear the message input field
    } catch (error) {
      setError(error.response.data.error);
      console.error(error.response.data.error);
    }
  };

  /**
   * Deletes a message via the API and emits a 'delete-message' event to tell other clients to refresh their chat
   */
  const deleteMessage = async (messageID) => {
    try {
      await axios.delete(
        `http://localhost:5000/chats/${room.room_id}/messages/${messageID}`,
        {
          withCredentials: true,
        }
      );
      await socket.emit("delete-message");
      fetchMessages();
      setShowConfirmationDialog(false);
      setShowDeletionMessage(true);
    } catch (error) {
      setError(error.response.data.error);
      console.error(error.response.data.error);
    }
  };

  // Fetch previous messages and initialise new socket instance when component mounts
  useEffect(() => {
    fetchMessages();
    const newSocket = io.connect("http://localhost:4000");
    setSocket(newSocket);

    // Listen for the 'receive-message' event from the WS server which signals that another WS client has posted a message.
    // Retrieve the latest messages from the API when this event is detected
    newSocket.on("receive-message", () => {
      fetchMessages();
    });

    // Listen for the 'delete-message' event from the WS server which signals that another WS client has posted a message.
    // Retrieve the latest messages from the API when this event is detected
    newSocket.on("delete-message", () => {
      fetchMessages();
    });

    // Clean up the event listener and close the socket connection when this component unmounts.
    return () => {
      newSocket.off("receive-message", () => {
        fetchMessages();
      });
      newSocket.disconnect();
    };
  }, []);

  // When the messageList state is updated, scroll to the bottom of the chat window
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Stack width="100%" height="75vh" justifyContent="space-between">
      <Stack
        overflow="auto"
        ref={chatBox}
        sx={{ overscrollBehavior: "contain" }}
      >
        {messages.map((message) => (
          <Box
            id="chatBubbleContainer"
            key={message.message_id}
            display="flex"
            justifyContent={
              message.member_id === user.id ? "flex-end" : "flex-start" // Owned messages appear on right, un-owned messages appear on left
            }
            color={"black"}
            m="0.5rem"
          >
            <Box
              id="chatBubble"
              maxWidth="90%"
              borderRadius="30px"
              p="0.2rem 1rem"
              // Use different colours for owned/un-owned messages
              bgcolor={
                message.member_id === user.id
                  ? theme.palette.success.main
                  : theme.palette.primary.main
              }
              sx={{
                borderTopRightRadius: message.member_id === user.id && "0",
                borderTopLeftRadius: message.member_id !== user.id && "0",
              }}
            >
              <Stack>
                <Typography
                  color={
                    message.member_id === user.id
                      ? theme.palette.success.contrastText
                      : theme.palette.primary.contrastText
                  }
                  borderBottom="1px solid black"
                  whiteSpace="pre-line" // Preserves newline characters in the message
                >
                  {message.content}
                </Typography>
                <Stack direction="row" justifyContent="flex-end">
                  <Typography
                    align="right"
                    component="p"
                    fontSize="small"
                    fontWeight="700"
                    color="black"
                    display="flex"
                    alignItems="center"
                  >
                    {`#${message.message_id} | `}
                    {formatTimestamp(message.timestamp)}
                  </Typography>
                   {/* If the user is not the author of the message, render a 'Reply' icon on the chat bubble */}
                  {(message.member_id !== user.id) && (
                    <Tooltip title="Reply">
                      <ReplyIcon
                        sx={{ marginLeft: "1rem", cursor: "pointer" }}
                        onClick={() => handleReply(message)}
                      />
                    </Tooltip>
                  )}
                  {/* If the user is the author of the message, or the owner of the chat room, render a 'Delete' icon on the chat bubble */}
                  {(message.member_id === user.id ||
                    user.id === room.member_id) && (
                    <Tooltip title="Delete message">
                      <DeleteForeverIcon
                        sx={{ marginLeft: "1rem", cursor: "pointer" }}
                        onClick={() =>
                          handleDeleteSelection(message.message_id)
                        }
                      />
                    </Tooltip>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Box>
        ))}
      </Stack>
      <Stack direction="row" paddingTop="0.5rem" alignItems="center">
        <MessageInputBox
          onChange={handleInputChange}
          value={newMessage}
          cursorPositionRef={cursorPositionRef}
        />
        <Fab
          size="medium"
          color="primary"
          aria-label="add"
          onClick={sendMessage}
        >
          <SendRoundedIcon />
        </Fab>
      </Stack>

      {/* Confirmation dialog for message deletion */}
      <Dialog
        open={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        sx={{ paddingLeft: "0.5rem" }}
      >
        <DialogTitle sx={{ paddingLeft: "0.5rem" }}>
          Confirm Message Deletion
        </DialogTitle>
        <DialogContentText paddingLeft="0.5rem">
          {`Are you sure you want to delete this message? Once deleted, a message cannot be recovered!`}
        </DialogContentText>
        <DialogActions>
          <Button onClick={() => setShowConfirmationDialog(false)}>
            Cancel
          </Button>
          <Button onClick={() => deleteMessage(messageToDelete)} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message Notification for successful message deletion */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showDeletionMessage}
        autoHideDuration={6000}
        onClose={() => setShowDeletionMessage(false)}
        message={"Message deleted successfully!"}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={() => setShowDeletionMessage(false)}
        >
          {"Message deleted successfully!"}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default ChatBox;
