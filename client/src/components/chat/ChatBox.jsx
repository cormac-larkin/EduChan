import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../authentication/AuthProvider";
import axios from "axios";
import io from "socket.io-client";
import { Box, Alert, Snackbar, Stack, Tooltip, Typography } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import Fab from "@mui/material/Fab";
import { useTheme } from "@emotion/react";
import MessageInputBox from "./MessageInputBox";
import formatTimestamp from "../../utils/formatTimestamp";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

function ChatBox({ room }) {
  const { user } = useContext(AuthContext);
  const chatBox = useRef();
  const cursorPositionRef = useRef(0);
  const theme = useTheme();

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState();
  const [showDeletionMessage, setShowDeletionMessage] = useState(false);

  const handleInputChange = (e) => {
    const { value, selectionStart } = e.target;
    setNewMessage(value);
    cursorPositionRef.current = selectionStart;
  };

  /**
   * Scrolls to the bottom of the chat, so the latest messages are in view
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
    if (newMessage === "") {
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
      setShowDeletionMessage(true);
      fetchMessages();
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
    <Stack width="100%" height="75vh">
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
              message.member_id === user.id ? "flex-end" : "flex-start"
            }
            color={"black"}
            m="0.5rem"
          >
            <Box
              id="chatBubble"
              maxWidth="80%"
              borderRadius="30px"
              p="0.2rem 1rem"
              bgcolor={
                message.member_id === user.id
                  ? theme.palette.success.light
                  : theme.palette.primary.light
              }
              sx={{
                borderTopRightRadius: message.member_id === user.id && "0",
                borderTopLeftRadius: message.member_id !== user.id && "0",
              }}
            >
              <Stack>
                {message.content}
                <Stack direction="row" justifyContent="flex-end">
                  <Typography
                    align="right"
                    component="p"
                    fontSize="small"
                    fontWeight="700"
                    color="grey.800"
                    display="flex"
                    alignItems="center"
                  >
                    {formatTimestamp(message.timestamp)}
                  </Typography>
                  {message.member_id === user.id && (
                    <Tooltip title="Delete message">
                      <DeleteForeverIcon
                        sx={{ marginLeft: "1rem", cursor: "pointer" }}
                        onClick={() => deleteMessage(message.message_id)}
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

    // <div className={styles.chatWindow}>
    //   <div className={styles.chatHeader}>
    //     <p>Live Chat</p>
    //   </div>
    //   <div className={styles.chatBody} >
    //     {messages.map((messageObj, index) => {
    //       return (
    //         <div
    //           key={index}
    //           className={styles.message}
    //           id={user.id === messageObj.member_id ? styles.you : styles.other}
    //         >
    //           <div>
    //             <div className={styles.messageContent}>
    //               <p>{messageObj.content}</p>
    //             </div>
    //             <div className={styles.messageMeta}>
    //               <p id="time">{messageObj.timestamp.slice(11, 16)}</p>
    //               {user.id === messageObj.member_id && (
    //                 <button
    //                   className={styles.deleteButton}
    //                   onClick={() => deleteMessage(messageObj.message_id)}
    //                 >
    //                   &#10006;
    //                 </button>
    //               )}
    //             </div>
    //           </div>
    //         </div>
    //       );
    //     })}
    //   </div>
    //   <div className={styles.chatFooter}>
    //     <input
    //       type="text"
    //       className={styles.messageInput}
    //       placeholder="Message..."
    //       value={currentMessage}
    //       onChange={(event) => {
    //         setCurrentMessage(event.target.value);
    //       }}
    //       onKeyDown={(event) => {
    //         event.key === "Enter" && sendMessage();
    //       }}
    //     />
    //     <button onClick={sendMessage}>&#9658;</button>
    //   </div>
    //   {error && <p>{error}</p>}
    // </div>
  );
}

export default ChatBox;
