import Chat from "../chat/Chat";
import { useParams } from "react-router-dom";

function ChatPage() {
  const { roomID } = useParams(); // Get the room ID from the URL
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      ChatPage
      <Chat roomID={roomID} />
    </div>
  );
}

export default ChatPage;
