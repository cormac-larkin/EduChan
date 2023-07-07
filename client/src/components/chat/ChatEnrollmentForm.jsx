import axios from "axios";
import { useState } from "react";

function ChatEnrollmentForm({ room }) {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);

  const handleSubmit = async (event) => {

    event.preventDefault();

    try {
      await axios.post(`http://localhost:5000/chats/${room.room_id}/members`, emails, {
        withCredentials: true,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    setEmails(prevEmails => ([...prevEmails, emailInput]));
    setEmailInput("");
  }

  return (
    <form style={{ display: "flex", flexDirection: "column" }} onSubmit={handleSubmit}>
      <h1>Add members to the {room.title} Chat-Room </h1>
      <label htmlFor="email">Email Address</label>
      <input
        type="text"
        id="email"
        value={emailInput}
        onChange={(e) => setEmailInput(e.target.value)}
      />
      <button type="button" onClick={handleSave}>Save Email</button>
      <button type="submit">Add Members</button>
    </form>
  );
}

export default ChatEnrollmentForm;
