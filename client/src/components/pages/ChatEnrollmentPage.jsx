import ManualStudentEnrollmentForm from "../forms/ManualStudentEnrollmentForm";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
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
import TeacherEnrolmentForm from "../forms/TeacherEnrolmentForm";
import LoadingSpinnerPage from "./LoadingSpinnerPage";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (room === undefined) {
    return <LoadingSpinnerPage/>;
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
          <b>Enrol Students in <Link to={`/chats/${room.room_id}`}>{`'${room.title}'`}</Link></b>
        </Typography>
      </Stack>
      <Divider />

      {/* Manual Student Enrolment Section */}
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

      {/* CSV/Batch Student Enrolment Section */}
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
            Batch Enrolment via File Upload
          </Typography>
        </AccordionSummary>

        <BatchEnrolmentForm room={room} />
      </Accordion>

      {/* Teacher Enrolment Section */}
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
            Add Teachers to Chat
          </Typography>
        </AccordionSummary>

        <TeacherEnrolmentForm room={room} />
      </Accordion>
    </Stack>
  );
}

export default ChatEnrollmentPage;
