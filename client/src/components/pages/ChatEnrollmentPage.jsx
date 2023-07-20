import ChatEnrollmentForm from "../chat/ChatEnrollmentForm";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ThreeCircles } from "react-loader-spinner";
import { Stack, Typography, Divider, Paper } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Error404Page from "./Error404Page";
import axios from "axios";
import paperStyles from "../../styles/paperStyles";

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

  return (
    <Stack>
      <Stack p="1rem" direction="row">
        <Stack justifyContent="center">
          <PersonAddIcon />
        </Stack>

        <Typography component="h1" variant="h5" align="left" pl="0.5rem">
          <b>{`Enrol Students in '${room.title}'`}</b>
        </Typography>
      </Stack>
      <Divider />
      <Paper elevation={6} sx={{...paperStyles, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingTop: "0.5rem"}} >
        <ChatEnrollmentForm room={room} />
      </Paper>
    </Stack>
  );
}

export default ChatEnrollmentPage;
