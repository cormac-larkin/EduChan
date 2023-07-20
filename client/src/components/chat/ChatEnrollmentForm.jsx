import axios from "axios";
import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Stack,
  Tooltip,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TagIcon from "@mui/icons-material/Tag";

function ChatEnrollmentForm({ room }) {
  const smallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const [studentNumberInput, setStudentNumberInput] = useState("");
  const [studentNumbers, setStudentNumbers] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  /**
   * Sends a POST request to the API to add new members to the chat room.
   * @param {*} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Ensure empty request is not sent
    if (studentNumbers.length === 0) {
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/chats/${room.room_id}/students`,
        studentNumbers,
        {
          withCredentials: true,
        }
      );
      setStudentNumbers([]);
      if (response.status === 207) {
        setApiResponse(
          `${response?.data?.message} See below for details. \n\nThe following students were successfully enrolled: [${response?.data?.successfulEnrolments}]\n\nThe following students could not found on the system: [${response?.data?.failedEnrolments}]`
        );
      }

      setShowAlert(true);
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
  const addToEnrolment = () => {
    if (studentNumberInput === "") {
      return;
    }

    if (studentNumbers.includes(studentNumberInput)) {
      alert("That Student has already been added to this enrolment!");
      return;
    }

    setStudentNumbers((prevNumbers) => [...prevNumbers, studentNumberInput]);
    setStudentNumberInput("");
  };

  const handleDelete = (numberToDelete) => {
    setStudentNumbers((prevNumbers) =>
      prevNumbers.filter((number) => number != numberToDelete)
    );
  };

  return (
    <Stack
      width="100%"
      direction={smallScreen ? "column" : "row"}
      justifyContent={!smallScreen && "space-evenly"}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        onKeyUp={(e) => {
          e.key === "Enter" && e.preventDefault();
        }}
      >
        <Stack direction="row" justifyContent="center">
          <SchoolIcon sx={{ marginTop: "0.2rem", marginRight: "0.2rem" }} />
          <Typography
            component="h1"
            variant="h5"
            align="center"
            paddingBottom="1rem"
          >
            Enrol Students
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center">
          <TextField
            margin="normal"
            required
            fullWidth
            id="roomName"
            label="Student Number"
            name="roomName"
            type="number"
            autoFocus
            value={studentNumberInput}
            onChange={(e) => setStudentNumberInput(e.target.value)}
            InputProps={{
              sx: { borderTopRightRadius: "0", borderBottomRightRadius: "0" },
              startAdornment: (
                <InputAdornment position="start">
                  <TagIcon />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Add to enrolment">
            <Button
              variant="contained"
              sx={{
                height: "3.5rem",
                marginTop: "0.45rem",
                borderTopLeftRadius: "0",
                borderBottomLeftRadius: "0",
              }}
              onClick={addToEnrolment}
            >
              <AddIcon />
            </Button>
          </Tooltip>
        </Stack>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={handleSubmit}
        >
          Submit Enrolment
        </Button>
      </Box>

      {/* List of Student Numbers saved to this enrolment */}
      {studentNumbers.length > 0 && (
        <Box
          sx={{
            margin: "0",
            width: smallScreen ? "100%" : "50%",
            borderTop: smallScreen && "1px solid black",
            paddingTop: smallScreen && "0.5rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Stack width="23rem">
            <Stack direction="row" justifyContent="center">
              <FormatListNumberedIcon
                sx={{ marginTop: "0.2rem", marginRight: "0.2rem" }}
              />
              <Typography
                component="h1"
                variant="h5"
                align="center"
                paddingBottom="1rem"
              >
                Enrolment List
              </Typography>
            </Stack>

            {studentNumbers.map((studentNumber) => {
              return (
                <Stack
                  key={studentNumber}
                  direction="row"
                  justifyContent="center"
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    width="95%"
                    m="0.2rem"
                    pl="0.5rem"
                    border="1px solid grey"
                    borderRadius="5px"
                  >
                    <Typography
                      align="center"
                      display="flex"
                      justifyContent="center"
                      flexGrow={1}
                    >
                      {studentNumber}
                    </Typography>
                    <Tooltip title="Remove from enrolment">
                      <Button
                        color="warning"
                        variant="contained"
                        sx={{
                          borderBottomLeftRadius: "0",
                          borderTopLeftRadius: "0",
                        }}
                        onClick={() => handleDelete(studentNumber)}
                      >
                        <ClearIcon />
                      </Button>
                    </Tooltip>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Notification containing API response after enrollment is submitted */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showAlert}
        onClose={() => setShowAlert(false)}
        sx={{whiteSpace: "pre-wrap"}}
      >
        <Alert
          severity="info"
          sx={{ width: "100%" }}
          onClose={() => setShowAlert(false)}
        >
          {apiResponse}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default ChatEnrollmentForm;
