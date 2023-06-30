import { useState } from "react";
import axios from "axios";
import styles from "./form.module.css";

function ChatCreationForm({ fetchChats }) {
  const [error, setError] = useState(); // State to track any errors returned from the API
  const [formData, setFormData] = useState({
    roomName: "",
  });

  /**
   * Handles input change events and updates the formData state accordingly.
   *
   * @param {Event} e - The input change event.
   * @returns {void}
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  /**
   * Handles form submission to create a new chat room via the API.
   *
   * @param {Event} event - The form submission event.
   * @returns {Promise<void>} - A Promise that resolves after handling the form submission.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post("http://localhost:5000/chat/create", formData, {
        withCredentials: true,
      });
      fetchChats(); // Fetch the latest chat data and update the 'chats' state on the TeacherDashboardPage
      setFormData({roomName: ""}); // Clear input field
    } catch (error) {
      setError(error.response.data.error);
      console.error(error.response.data.error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1>Create a new Chatroom</h1>
      <label htmlFor="roomName">Room Name</label>
      <input
        type="text"
        name="roomName"
        value={formData.roomName}
        onChange={(e) => handleInputChange(e)}
      />
      <button type="submit">Create Room</button>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </form>
  );
}

export default ChatCreationForm;
