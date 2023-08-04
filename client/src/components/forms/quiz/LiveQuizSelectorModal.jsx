import { useContext, useEffect, useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import { AuthContext } from "../../authentication/AuthProvider";
import axios from "axios";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function LiveQuizSelectorModal({
  room,
  socket,
  fetchMessages,
  selectorModalOpen,
  setSelectorModalOpen,
  setResultsModalOpen
}) {
  const { user } = useContext(AuthContext);

  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [quizToLaunch, setQuizToLaunch] = useState("");

  const handleClose = () => setSelectorModalOpen(false);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/users/${user.id}/quizzes`,
        { withCredentials: true }
      );
      setAvailableQuizzes(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Post a message to the chatroom which contains the quiz_id of the quiz we want to launch.
  // The ChatBox component will check if a quiz ID is attached to any message, and render the corresponding QuizPage if so.
  const launchQuiz = async (event, quizID) => {

    event.preventDefault();

    try {
      await axios.post(
        `http://localhost:5000/chats/${room.room_id}/messages`,
        { content: "Live Quiz", authorID: user.id, parent_id: null, quizID: quizID },
        { withCredentials: true }
      );
      // Emit 'send-message' event to WS server and fetch latest messages from the API
      // The chat server will emit the 'receive' message event which will cause all other clients to refresh their messages
      await socket.emit("send-message", room.title);
      fetchMessages();
      setResultsModalOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Modal
        aria-labelledby="quiz-selector-modal"
        aria-describedby="select the quiz to launch in the chatroom"
        open={selectorModalOpen}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={selectorModalOpen}>
          <Box
            component="form"
            sx={{ ...style, maxWidth: "95vw", borderRadius: "5px" }}
            onSubmit={(event) => {launchQuiz(event, quizToLaunch); handleClose()}}
          >
            <Typography
              id="transition-modal-title"
              variant="h6"
              component="h2"
              mb="1rem"
            >
              Select a Quiz to launch
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Quiz</InputLabel>
              <Select
                labelId="quizSelectorLabels"
                id="demo-simple-select"
                value={quizToLaunch}
                label="Quiz"
                onChange={(e) => setQuizToLaunch(e.target.value)}
              >
                {availableQuizzes.map((quiz, index) => (
                  <MenuItem key={index} value={quiz.quiz_id}>
                    {quiz.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Begin
            </Button>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}

export default LiveQuizSelectorModal;
