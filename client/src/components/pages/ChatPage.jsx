import Chat from "../chat/Chat";
import { Link, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../authentication/AuthProvider";
import { ThreeCircles } from "react-loader-spinner";
import axios from "axios";
import Error404Page from "./Error404Page";


function ChatPage() {
  const { roomID } = useParams(); // Get the room ID from the URL
  const { user } = useContext(AuthContext);

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
    return <Error404Page />
  }

  return (
    <>
     <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "80%" }}>
        <h1><u>{room.title} Module Chat</u></h1>
        {user.isTeacher && <button><Link to={`/chat/${room.room_id}/enrol`} state={room}>Add Members to Chat-Room</Link></button>}
        <Chat room={room} />
      </div>
      
    </>
  );
}

export default ChatPage;
