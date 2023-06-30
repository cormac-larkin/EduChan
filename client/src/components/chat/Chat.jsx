import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import axios from "axios";
import styles from "./chat.module.css";
import io from "socket.io-client";

function Chat({ roomID }) {

  const { user } = useContext(AuthContext);

  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState();

  /**
   * Fetches the latest messages for this chatroom from the database
   */
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/chat/${roomID}/messages`, {
        withCredentials: true
      });
      setMessageList(response.data);
    } catch (error) {
      setError(error.response.data.error)
      console.error(error.response.data.error);
    }
  }

  /**
   * Handles sending messages via WebSocket and also via the REST API
   */
  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        authorID: user.id,
        content: currentMessage,
      };

      // POST the message to the API
      try {
        await axios.post(`http://localhost:5000/chat/${roomID}/messages`, messageData, {
          withCredentials: true
        })
      } catch (error) {
        setError(error.response.data.error);
        console.error(error.response.data.error);
      }

      // Emit 'send-message' event to chat server and fetch latest messages from the API
      await socket.emit("send-message", messageData);
      fetchMessages();
    }
  };

  // Fetch previous messages and initialise new socket instance when component mounts
  useEffect(() => {
    fetchMessages();
    const newSocket = io.connect("http://localhost:4000");
    setSocket(newSocket);

    // Listen for the 'receive-message' event and retrieve the latest messages from the API
    newSocket.on('receive-message', () => {
      console.log("RECEIVED")
      fetchMessages();
    });

    return () => {
      newSocket.off('receive-message', () =>{
        fetchMessages();
      }); // Clean up event listener when component unmounts
      newSocket.disconnect(); // Close the socket connection when the component unmounts
    };
  }, []);

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatHeader}>
        <p>Live Chat</p>
      </div>
      <div className={styles.chatBody}>
        {messageList.map((messageObj, index) => {
          return (
            <div
              key={index}
              className="message"
              id={user.id === messageObj.authorID ? "you" : "other"}
            >
              <div>
                <div className={styles.messageContent}>
                  <p>{messageObj.content}</p>
                </div>
                <div className={styles.messageMeta}>
                  <p id="time">{messageObj.timestamp}</p>
                  <p id="author">{messageObj.authorID}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.chatFooter}>
        <input
          type="text"
          placeholder="Message..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyDown={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
      {error && <p>{error}</p>}
    </div>
  );
}

export default Chat;
