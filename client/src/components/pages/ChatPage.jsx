import Chat from "../chat/Chat";
import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthProvider";
import { ThreeCircles } from "react-loader-spinner";
import ChatEnrollmentForm from "../chat/ChatEnrollmentForm";

import axios from "axios";


function ChatPage() {
  const { roomID } = useParams(); // Get the room ID from the URL
  const { user } = useContext(AuthContext);

  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);

  const fetchRoom = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/chats/${roomID}`,
        {
          withCredentials: true,
        }
      );
      setRoom(response.data);
    } catch (error) {
      setError(error.response.data.error);
      console.error(error);
    }
  };

  useEffect(() => {
      fetchRoom();
  }, []);

  if (room === null) {
    return <ThreeCircles />;
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column" }}>
        ChatPage
        {error && <p>{error}</p>}
        {user.isTeacher && <ChatEnrollmentForm room={room} />}
        <Chat room={room} />
      </div>
    </>
  );
}

export default ChatPage;
