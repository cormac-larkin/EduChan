import { useContext, useEffect, useState } from "react";
import axios from "axios";
import ChatCreationForm from "../forms/ChatCreationForm";
import { Link } from "react-router-dom";
import styles from "./dashboardPage.module.css";
import { AuthContext } from "../context/AuthProvider";

function TeacherDashboardPage() {

  const {user} = useContext(AuthContext);

  const [error, setError] = useState();
  const [chats, setChats] = useState([]);

  /**
   * Sends a GET request to the API to retrieve all chats owned by this Teacher.
   * Updates the 'chats' state with the latest data returned by the API.
   */
  const fetchChats = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/users/${user.id}/chats/owned`, {
        withCredentials: true,
      });
      setChats(response.data);
    } catch (error) {
      setError(error.response.data.error);
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
      fetchChats();
    } catch (error) {
      setError(error.response.data.error);
      console.error(error.response.data.error);
    }
  };

  // On first render, fetch all this Teacher's chats from the database
  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h1>Teacher Dashboard</h1>

      {error && <p>{error}</p>}

      {chats.map((chat, index) => (
        <div key={index} className={styles.chat}>
          <h3>{chat.title}</h3>
          <div className={styles.buttonContainer}>
            <button>
              <Link to={`/chat/${chat.room_id}`}>View</Link>
            </button>
            <button
              className={styles.delete}
              onClick={() => handleChatDeletion(chat.room_id)}
            >
              Delete Room
            </button>
          </div>
        </div>
      ))}

      <ChatCreationForm fetchChats={fetchChats} />
    </div>
  );
}

export default TeacherDashboardPage;
