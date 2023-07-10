import axios from "axios";
import styles from "./dashboardPage.module.css";
import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthProvider";

function StudentDashboardPage() {
  const { user } = useContext(AuthContext);

  const [joinedChats, setJoinedChats] = useState([]);

  const fetchJoinedChats = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/users/${user.id}/chats/joined`, {
        withCredentials: true
      });
      setJoinedChats(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchJoinedChats();
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h1>Student Dashboard</h1>

      {joinedChats.map((chat, index) => (
        <div key={index} className={styles.chat}>
          <h3>{chat.title}</h3>
          <div className={styles.buttonContainer}>
            <button>
              <Link to={`/chat/${chat.room_id}`}>View</Link>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StudentDashboardPage;
