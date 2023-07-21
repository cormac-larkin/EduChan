import ManualStudentEnrollmentForm from "../forms/ManualStudentEnrollmentForm";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ThreeCircles } from "react-loader-spinner";
import {
  Stack,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Error404Page from "./Error404Page";
import axios from "axios";
import paperStyles from "../../styles/paperStyles";
import BatchEnrolmentForm from "../forms/BatchEnrolmentForm";

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

      <Accordion
        elevation={6}
        disableGutters
        sx={{ ...paperStyles, borderRadius: "5px" }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
          sx={{ borderBottom: "1px solid grey" }}
        >
          <Typography
            sx={{ width: "75%", flexShrink: 0 }}
            component="h1"
            variant="h5"
          >
            Manual Student Enrolment
          </Typography>
        </AccordionSummary>
        <ManualStudentEnrollmentForm room={room} />
      </Accordion>

      <Accordion
        elevation={6}
        disableGutters
        sx={{ ...paperStyles, borderRadius: "5px" }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
          sx={{ borderBottom: "1px solid grey" }}
        >
          <Typography
            sx={{ width: "75%", flexShrink: 0 }}
            component="h1"
            variant="h5"
          >
            Batch Enrolment via file upload
          </Typography>
        </AccordionSummary>

        <BatchEnrolmentForm room={room} />

      </Accordion>
    </Stack>
  );
}

export default ChatEnrollmentPage;
