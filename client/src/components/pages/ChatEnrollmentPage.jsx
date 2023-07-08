import ChatEnrollmentForm from "../chat/ChatEnrollmentForm";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ThreeCircles } from "react-loader-spinner";
import Error404Page from "./Error404Page";
import axios from "axios";

function ChatEnrollmentPage() {
  const { roomID } = useParams(); // Get the room ID from the URL
  const [room, setRoom] = useState();

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
    } catch (error) {
      setRoom(null);
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, []);

  if (room === undefined) {
    return <ThreeCircles />;
  }

  if (room === null) {
    return <Error404Page />;
  }

  return <ChatEnrollmentForm room={room} />;
}

export default ChatEnrollmentPage;
