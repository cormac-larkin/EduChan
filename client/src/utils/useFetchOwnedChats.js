import { useEffect, useState } from "react";
import axios from "axios";

/**
 * Sends a GET request to the API to retrieve all chats owned by a User.
 * Updates the 'chats' state with the latest data returned by the API.
 */
const useFetchOwnedChats = async (user) => {
  const [ownedChats, setOwnedChats] = useState(null);
  const [ownedChatsFetchError, setOwnedChatsFetchError] = useState(null);

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
      setOwnedChatsFetchError(error.response.data.error);
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOwnedChats();
  });

  return {
    ownedChats,
    ownedChatsFetchError,
  };
};

export default useFetchOwnedChats;
