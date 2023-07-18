import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../authentication/AuthProvider";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CardContainer from "../UI/CardContainer";
import {
  Accordion,
  Box,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

function BrowseChatsPage() {
  const { user } = useContext(AuthContext);

  const [ownedChats, setOwnedChats] = useState([]);
  const [joinedChats, setJoinedChats] = useState([]);
  const [ownedChatsError, setOwnedChatsError] = useState(null);
  const [joinedChatsError, setJoinedChatsError] = useState(null);
  const [chatDeletionError, setChatDeletionError] = useState(null);
  const [expandAccordion, setExpandAccordion] = useState(true);

  /**
   * Sends a GET request to the API to retrieve all chats owned by a User.
   * Updates the 'chats' state with the latest data returned by the API.
   */
  const fetchOwnedChats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/users/${user.id}/chats/owned`,
        {
          withCredentials: true,
        }
      );
      setOwnedChats(response.data);
    } catch (error) {
      setOwnedChatsError(
        error.response.data.error ||
          "An error occurred when fetching the chat data"
      );
      console.error(error);
    }
  };

  /**
   * Sends a GET request to the API to retrieve all chats joined by a User.
   * Updates the 'chats' state with the latest data returned by the API.
   */
  const fetchJoinedChats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/users/${user.id}/chats/joined`,
        {
          withCredentials: true,
        }
      );
      setJoinedChats(response.data);
    } catch (error) {
      setJoinedChatsError(
        error.response.data.error ||
          "An error occurred when fetching the chat data"
      );
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
      fetchOwnedChats();
    } catch (error) {
      setChatDeletionError(error.response.data.error);
      console.error(error.response.data.error);
    }
  };

  // On first render, fetch all this Teacher's chats from the database
  useEffect(() => {
    fetchOwnedChats();
    fetchJoinedChats();
  }, []);

  return (
    <Box>
      <Typography component="h1" variant="h4" align="center">
        Browse Chats
      </Typography>

      <Accordion
        expanded={expandAccordion}
        onChange={() => setExpandAccordion((prevState) => !prevState)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography
            component="h1"
            variant="h5"
          >{`Owned Chats (${ownedChats.length})`}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <CardContainer
            chats={ownedChats}
            onChatDelete={handleChatDeletion}
            error={ownedChatsError}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography
            component="h1"
            variant="h5"
          >{`Joined Chats (${joinedChats.length})`}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <CardContainer
            chats={joinedChats}
            error={joinedChatsError}
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default BrowseChatsPage;