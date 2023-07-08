import axios from "axios";
import { useState } from "react";

function ChatEnrollmentForm({ room }) {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);

  /**
   * Sends a POST request to the API to add new members to the chat room.
   * @param {*} event 
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post(
        `http://localhost:5000/chats/${room.room_id}/members`,
        emails,
        {
          withCredentials: true,
        }
      );
      setEmails([]);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Handles adding new email addresses to the enrolment list
   * 
   * @param {String} email 
   * @returns {void}
   */
  const addEmailToList = (email) => {

    if (email === "") {
      return;
    }

    if (emails.includes(email)) {
      alert("That email has already been added to the list!");
      return;
    }

    setEmails((prevEmails) => [...prevEmails, emailInput]);
    setEmailInput("");
  };

  const deleteEmail = (emailToDelete) => {
    setEmails((prevEmails) => prevEmails.filter(email => email != emailToDelete));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <form
        style={{ display: "flex", flexDirection: "column" }}
        onSubmit={handleSubmit}
      >
        <h1>Add members to the {room.title} Chat-Room </h1>
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          placeholder="Type the email address of the member you wish to add"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
        <button type="button" onClick={() => addEmailToList(emailInput)}>
          Add Email to List
        </button>
        <button type="submit">Enrol Members</button>
      </form>
      {emails.length > 0 && (
        <div
          className="emailContainer"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "rgba(111, 111, 111)",
            borderRadius: "5px",
          }}
        >
          <h3>Emails to add</h3>
          {emails.map((email, index) => (
            <div
              key={index}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <p>{email}</p>
              <button onClick={() => deleteEmail(email)} style={{backgroundColor: "red"}}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatEnrollmentForm;
