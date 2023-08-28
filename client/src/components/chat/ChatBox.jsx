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
  Badge,
  useMediaQuery,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import Fab from "@mui/material/Fab";
import { useTheme } from "@emotion/react";
import MessageInputBox from "./MessageInputBox";
import formatTimestamp from "../../utils/formatTimestamp";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ReplyIcon from "@mui/icons-material/Reply";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReplyBubble from "./ReplyBubble";
import LiveQuizSelectorModal from "../forms/quiz/LiveQuizSelectorModal";
import QuizPage from "../pages/quiz/QuizPage";
import ViewQuizAttemptPage from "../pages/quiz/ViewQuizAttemptPage";
import PromptModal from "../prompt/PromptModal";
import StudentPrompt from "../prompt/StudentPrompt";
import TeacherPrompt from "../prompt/TeacherPrompt";
import QuizReportPage from "../pages/quiz/QuizReportPage";
import QRCodeModal from "../UI/QRCodeModal";

function ChatBox({
  room,
  selectorModalOpen,
  setSelectorModalOpen,
  promptModalOpen,
  setPromptModalOpen,
  QRCodeModalOpen,
  setQRCodeModalOpen,
}) {
  const { user } = useContext(AuthContext);
  const chatBox = useRef();
  const cursorPositionRef = useRef(0);
  const theme = useTheme();
  const smallScreen = useMediaQuery("(max-width: 450px)");
  const medScreen = useMediaQuery("(max-width: 600px)");

  // States for handling message sending
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  // Array containing the Unique SocketID of all connected users/clients
  const [activeUsers, setActiveUsers] = useState([]);

  // States for handling message deletion
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [showDeletionMessage, setShowDeletionMessage] = useState(false);
  const [showDeleteConfirmationDialog, setShowDeleteConfirmationDialog] =
    useState(false);

  // States for handling message replies
  const [isReply, setIsReply] = useState(false);
  const [parentMessage, setParentMessage] = useState(null);

  // States for handling message hiding
  const [messageToHide, setMessageToHide] = useState(null);
  const [displayHideMessage, setDisplayHideMessage] = useState(false);
  const [showHideConfirmationDialog, setShowHideConfirmationDialog] =
    useState(false);

  // States for handling message un-hiding
  const [messageToUnhide, setMessageToUnhide] = useState(null);
  const [displayUnhideMessage, setDisplayUnhideMessage] = useState(false);
  const [showUnhideConfirmationDialog, setShowUnhideConfirmationDialog] =
    useState(false);

  // State to track if the chat should scroll to bottom on re-render (eg if new message was sent/delivered)
  const [shouldScroll, setShouldScroll] = useState(false);

  // States for handling API errors
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

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
  const handleReply = (parentMessage) => {
    setParentMessage(parentMessage);
    setIsReply(true);
  };

  const handleReplyClose = () => {
    setIsReply(false);
    setParentMessage(null);
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
      setError(
        error?.response?.data?.error || "Error: Unable to retrieve messages"
      );
      setShowError(true);
      console.error(error);
    }
  };

  /**
   * POSTS a message to the REST API and emits a 'send-message' event which tells other clients to refresh their chat.
   */
  const sendMessage = async () => {
    // Ensure empty messages are not sent
    if (newMessage === "" || newMessage.startsWith(" ")) {
      alert("Messages must not be empty or begin with a whitespace!");
      return;
    }

    const messageData = {
      authorID: user.id,
      content: newMessage,
      parentID: parentMessage?.message_id,
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
      await socket.emit("send-message", room.title);
      setShouldScroll(true);
      fetchMessages();
      setNewMessage(""); // Clear the message input field
      setIsReply(false); // Hide the reply box
      setParentMessage(null); // Reset the parent message state
    } catch (error) {
      setError(error?.response?.data?.error || "Error: Unable to send message");
      setShowError(true);
      console.error(error);
    }
  };

  /**
   * Records the ID of the message that the user wishes to delete, and opens a confirmation dialog.
   *
   * @param {String} messageID
   */
  const handleDeleteSelection = (messageID) => {
    setMessageToDelete(messageID);
    setShowDeleteConfirmationDialog(true);
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
      await socket.emit("delete-message", room.title);
      fetchMessages();
      setShowDeleteConfirmationDialog(false);
      setShowDeletionMessage(true);
    } catch (error) {
      setError(
        error?.response?.data?.error || "Error: Unable to delete message"
      );
      setShowError(true);
      console.error(error.response.data.error);
    }
  };

  const handleHideSelection = (messageID) => {
    setMessageToHide(messageID);
    setShowHideConfirmationDialog(true);
  };

  const hideMessage = async (messageID) => {
    try {
      await axios.put(
        `http://localhost:5000/chats/${room.room_id}/messages/${messageID}/hide`,
        {},
        {
          withCredentials: true,
        }
      );
      await socket.emit("delete-message", room.title);
      fetchMessages();
      setShowHideConfirmationDialog(false);
      setDisplayHideMessage(true);
    } catch (error) {
      setError(error?.response?.data?.error || "Error: Unable to hide message");
      setShowError(true);
      console.error(error);
    }
  };

  const handleUnhideSelection = (message) => {
    setMessageToUnhide(message);
    setShowUnhideConfirmationDialog(true);
  };

  const unHideMessage = async (messageID) => {
    try {
      await axios.put(
        `http://localhost:5000/chats/${room.room_id}/messages/${messageID}/show`,
        {},
        {
          withCredentials: true,
        }
      );
      await socket.emit("delete-message", room.title);
      fetchMessages();
      setShowUnhideConfirmationDialog(false);
      setDisplayUnhideMessage(true);
    } catch (error) {
      setError(
        error?.response?.data?.error || "Error: Unable to un-hide message"
      );
      setShowError(true);
      console.error(error);
    }
  };

  const likeMessage = async (messageID) => {
    try {
      await axios.post(
        `http://localhost:5000/chats/${room.room_id}/messages/${messageID}/like`,
        {},
        {
          withCredentials: true,
        }
      );
      await socket.emit("delete-message", room.title);
      fetchMessages();
    } catch (error) {
      setError(error?.response?.data?.error || "Error: Unable to like message");
      setShowError(true);
      console.error(error);
    }
  };

  const unLikeMessage = async (messageID) => {
    try {
      await axios.delete(
        `http://localhost:5000/chats/${room.room_id}/messages/${messageID}/like`,
        {
          withCredentials: true,
        }
      );
      await socket.emit("delete-message", room.title);
      fetchMessages();
    } catch (error) {
      setError(
        error?.response?.data?.error || "Error: Unable to un-like message"
      );
      setShowError(true);
      console.error(error);
    }
  };

  // Fetch previous messages and initialise new socket instance when component mounts
  useEffect(() => {
    fetchMessages();
    const newSocket = io.connect("http://localhost:4000");
    setSocket(newSocket);

    // Join the socket room for this chat (so any events will only be emitted to other clients in this room)
    newSocket.emit("join-room", room.title);

    // Listen for the 'receive-message' event from the WS server which signals that another WS client has posted a message.
    // Retrieve the latest messages from the API when this event is detected
    newSocket.on("receive-message", () => {
      fetchMessages();
    });

    // Refresh the messages when a Teacher ends a quiz
    newSocket.on("end-quiz", () => {
      fetchMessages();
    });

    // Refresh messages when a new prompt response is sent, so the Teacher can receive the latest responses
    newSocket.on("prompt-response", () => {
      fetchMessages();
    });

    // Listen for the 'delete-message' event from the WS server which signals that another WS client has posted a message.
    // Retrieve the latest messages from the API when this event is detected
    newSocket.on("delete-message", () => {
      fetchMessages();
    });

    newSocket.on("update-participants", (participants) => {
      setActiveUsers(participants);
    });

    // Clean up the event listener and close the socket connection when this component unmounts.
    return () => {
      newSocket.off("receive-message", () => {
        fetchMessages();
      });
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the messageList state is updated after a new message, scroll to the bottom of the chat window
  useEffect(() => {
    if (shouldScroll) {
      scrollToBottom();
    }
    setShouldScroll(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return (
    <>
      {/* Modal for selecting which quiz to launch in the chat - Controlled by ChatPageKebabMenu */}
      <LiveQuizSelectorModal
        room={room}
        socket={socket}
        fetchMessages={fetchMessages}
        selectorModalOpen={selectorModalOpen}
        setSelectorModalOpen={setSelectorModalOpen}
      />

      {/* Modal for creating and posting Prompts in the chat */}
      <PromptModal
        room={room}
        socket={socket}
        fetchMessages={fetchMessages}
        promptModalOpen={promptModalOpen}
        setPromptModalOpen={setPromptModalOpen}
      />

      {/* Modal for viewing QR Code */}
      <QRCodeModal
        QRCodeModalOpen={QRCodeModalOpen}
        setQRCodeModalOpen={setQRCodeModalOpen}
      />

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
              color="black"
              m="0.5rem"
            >
              <Box
                id="chatBubble"
                maxWidth={!medScreen ? "80%" : "100%"}
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
                    {/* If the message is a reply, render the reply bubble with the parent message inside */}
                    {message.parent_id && !message.hidden && (
                      <span>
                        <ReplyBubble
                          messageID={message.parent_id}
                          messageContent={message.parent_content}
                          innerBubble={true}
                        />
                      </span>
                    )}
                    {(() => {
                      if (message?.hidden) {
                        return <i>--- Message Hidden ---</i>;
                      } else if (
                        message?.quiz_id &&
                        message?.quiz_ended &&
                        user?.isTeacher
                      ) {
                        return (
                          <QuizReportPage embeddedQuizID={message?.quiz_id} />
                        );
                      } else if (
                        message?.quiz_id &&
                        message?.quiz_ended &&
                        !user?.isTeacher
                      ) {
                        return (
                          <ViewQuizAttemptPage quizID={message?.quiz_id} />
                        );
                      } else if (message?.quiz_id && !message?.quiz_ended) {
                        return (
                          <QuizPage
                            quizID={message.quiz_id}
                            messageID={message.message_id}
                            socket={socket}
                            room={room}
                            fetchMessages={fetchMessages}
                          />
                        );
                      } else if (message.prompt_id && !user.isTeacher) {
                        return (
                          <StudentPrompt
                            promptID={message?.prompt_id}
                            socket={socket}
                            room={room}
                          />
                        );
                      } else if (message.prompt_id && user.isTeacher) {
                        return (
                          <TeacherPrompt
                            promptID={message?.prompt_id}
                            messages={messages}
                          />
                        );
                      } else {
                        return message?.content;
                      }
                    })()}
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent={
                      message.member_id === user.id ? "flex-end" : "flex-start"
                    }
                    alignItems="center"
                  >
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
                    {message.member_id !== user.id && (
                      <Tooltip title="Reply">
                        <ReplyIcon
                          sx={{ marginLeft: "1rem", cursor: "pointer" }}
                          onClick={() => handleReply(message)}
                        />
                      </Tooltip>
                    )}
                    {/* If the user is a Teacher, render a 'Delete' icon on the chat bubble */}
                    {user.isTeacher && (
                      <Tooltip title="Delete message">
                        <DeleteForeverIcon
                          sx={{ marginLeft: "0.5rem", cursor: "pointer" }}
                          onClick={() =>
                            handleDeleteSelection(message.message_id)
                          }
                        />
                      </Tooltip>
                    )}
                    {/* If the user is a Teacher or owns the message, and message is not hidden, render a 'Hide' icon on the chat bubble */}
                    {(user.isTeacher || user.id === message.member_id) &&
                      !message.hidden && (
                        <Tooltip title="Hide message">
                          <VisibilityOffIcon
                            sx={{ marginLeft: "1rem", cursor: "pointer" }}
                            onClick={() =>
                              handleHideSelection(message.message_id)
                            }
                          />
                        </Tooltip>
                      )}
                    {/* If the user is a Teacher, and the message is hidden, render a 'Show' icon on the chat bubble */}
                    {(user.isTeacher || user.id === message.member_id) &&
                      message.hidden && (
                        <Tooltip title="Show message">
                          <VisibilityIcon
                            sx={{ marginLeft: "1rem", cursor: "pointer" }}
                            onClick={() => handleUnhideSelection(message)}
                          />
                        </Tooltip>
                      )}
                    {/* Display Like button if User has not already liked this comment */}
                    {!message.likedBy.includes(user.id) && (
                      <Badge
                        badgeContent={message.likedBy.length}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        color="secondary"
                      >
                        <Tooltip title="Like message">
                          <ThumbUpIcon
                            onClick={() => likeMessage(message.message_id)}
                            sx={{ marginLeft: "1rem", cursor: "pointer" }}
                          />
                        </Tooltip>
                      </Badge>
                    )}
                    {/* Display un-like button if User has already liked this comment */}
                    {message.likedBy.includes(user.id) && (
                      <Badge
                        badgeContent={message.likedBy.length}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        color="secondary"
                      >
                        <Tooltip title="Un-like this message">
                          <ThumbDownIcon
                            color="action"
                            onClick={() => unLikeMessage(message.message_id)}
                            sx={{ marginLeft: "1rem", cursor: "pointer" }}
                          />
                        </Tooltip>
                      </Badge>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </Box>
          ))}
        </Stack>

        <Stack direction="row" paddingTop="0.5rem" alignItems="center">
          <Stack
            flexGrow={1}
            marginRight="0.5rem"
            maxWidth={smallScreen ? "85%" : "100%"}
          >
            {/* Reply Bubble */}
            {isReply && (
              <ReplyBubble
                messageID={parentMessage.message_id}
                messageContent={parentMessage.content}
                onClose={handleReplyClose}
                innerBubble={false}
              />
            )}

            <MessageInputBox
              onChange={handleInputChange}
              value={newMessage}
              cursorPositionRef={cursorPositionRef}
              isReply={isReply}
              room={room}
            />
          </Stack>
          <Box>
            <Fab
              disabled={room.read_only} // Disable send button if room is read-only
              size="medium"
              color="primary"
              aria-label="send"
              onClick={sendMessage}
              sx={{ height: "3rem", width: "3rem" }}
            >
              <SendRoundedIcon />
            </Fab>
          </Box>
        </Stack>

        {/* Confirmation dialog for message deletion */}
        <Dialog
          open={showDeleteConfirmationDialog}
          onClose={() => setShowDeleteConfirmationDialog(false)}
          sx={{ paddingLeft: "0.5rem" }}
        >
          <DialogTitle sx={{ paddingLeft: "0.5rem" }}>
            Confirm Message Deletion
          </DialogTitle>
          <DialogContentText paddingLeft="0.5rem">
            {`Are you sure you want to delete this message? This action is permanent, and any replies to this message will also be permanently deleted!`}
          </DialogContentText>
          <DialogActions>
            <Button onClick={() => setShowDeleteConfirmationDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => deleteMessage(messageToDelete)}
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation dialog for message hiding */}
        <Dialog
          open={showHideConfirmationDialog}
          onClose={() => setShowHideConfirmationDialog(false)}
          sx={{ paddingLeft: "0.5rem" }}
        >
          <DialogTitle sx={{ paddingLeft: "0.5rem" }}>
            Hide this message?
          </DialogTitle>
          <DialogContentText paddingLeft="0.5rem">
            {`Are you sure you want to hide this message? The message content will be hidden from all users. You may un-hide the message later.`}
          </DialogContentText>
          <DialogActions>
            <Button onClick={() => setShowHideConfirmationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => hideMessage(messageToHide)} color="error">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation dialog for message un-hiding */}
        <Dialog
          open={showUnhideConfirmationDialog}
          onClose={() => setShowUnhideConfirmationDialog(false)}
          sx={{ paddingLeft: "0.5rem", whiteSpace: "pre-wrap" }}
        >
          <DialogTitle sx={{ paddingLeft: "0.5rem" }}>
            Show this message?
          </DialogTitle>
          <DialogContentText paddingLeft="0.5rem">
            {`Are you sure you want to un-hide this message?\n\n'${messageToUnhide?.content}'\n\nThe message content will be visible to all users. You may hide the message again later.`}
          </DialogContentText>
          <DialogActions>
            <Button onClick={() => setShowUnhideConfirmationDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => unHideMessage(messageToUnhide.message_id)}
              color="error"
            >
              Confirm
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

        {/* Success Message Notification for successful message hiding */}
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={displayHideMessage}
          autoHideDuration={6000}
          onClose={() => setDisplayHideMessage(false)}
          message={"Message hidden successfully!"}
        >
          <Alert
            severity="success"
            sx={{ width: "100%" }}
            onClose={() => setDisplayHideMessage(false)}
          >
            {"Message hidden successfully!"}
          </Alert>
        </Snackbar>

        {/* Success Message Notification for successful message unhiding */}
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={displayUnhideMessage}
          autoHideDuration={6000}
          onClose={() => setDisplayUnhideMessage(false)}
          message={"Message un-hidden successfully!"}
        >
          <Alert
            severity="success"
            sx={{ width: "100%" }}
            onClose={() => setDisplayUnhideMessage(false)}
          >
            {"Message unhidden successfully!"}
          </Alert>
        </Snackbar>

        {/* Error message if API call fails */}
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={showError}
          autoHideDuration={6000}
          onClose={() => setShowError(false)}
        >
          <Alert
            severity="error"
            sx={{ width: "100%" }}
            onClose={() => setShowError(false)}
          >
            {error}
          </Alert>
        </Snackbar>
      </Stack>
    </>
  );
}

export default ChatBox;
