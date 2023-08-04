import {
  Stack,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import { useState, useEffect } from "react";
import LoadingSpinnerPage from "../pages/error/LoadingSpinnerPage";
import Error404Page from "../pages/error/Error404Page";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import axios from "axios";

function TeacherPrompt({ promptID, messages }) {
  // States for handling retrieving the prompt from the API
  const [prompt, setPrompt] = useState();
  const [loading, setLoading] = useState(true);

  // States for handling retrieving the responses to this prompt from the API
  const [responses, setResponses] = useState([]);

  const fetchPrompt = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/prompts/${promptID}`,
        { withCredentials: true }
      );
      setPrompt(response?.data);
      setLoading(false);
    } catch (error) {
      setPrompt(null); // Set prompt as null if it cannot be retrieved
      setLoading(false);
      console.error(error);
    }
  };

  const fetchResponses = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/prompts/${promptID}/responses`,
        { withCredentials: true }
      );
      setResponses(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPrompt();
    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchResponses(); // Update the list of responses when new ones are posted
  }, [messages]);

  // While API call is in progress, show loading spinner
  if (loading) {
    return <LoadingSpinnerPage />;
  }

  // If prompt cannot be retrieved from the API, show the 404 error page
  if (prompt === null) {
    return <Error404Page />;
  }

  return (
    <Stack>
      <Typography variant="h5" mt="1rem" align="center" pb="0.5rem" borderBottom="1px solid black">
      {`Q: ${prompt.content}`}
      </Typography>

      <List>
        {responses.map((response, index) => (
          <ListItemButton key={index} sx={{borderRadius: "5px"}}>
            <ListItemIcon>
              <QuestionAnswerIcon />
            </ListItemIcon>
            <ListItemText primary={response.content} />
          </ListItemButton>
        ))}
      </List>
    </Stack>
  );
}

export default TeacherPrompt;
