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
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import validateEmailAddress from "../../utils/validateEmailAddress";

function TeacherEnrolmentForm({ room }) {
  const smallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const [teacherEmailInput, setTeacherEmailInput] = useState("");
  const [teacherEmails, setTeacherEmails] = useState([]);
  const [enrolmentReport, setEnrolmentReport] = useState("");
  const [showEnrolmentReport, setShowEnrolmentReport] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const handleEmailChange = (e) => {
    const value = e.target.value;

    setTeacherEmailInput(value);
    setEmailError(!validateEmailAddress(value) && value !== "");
  };

  /**
   * Sends a POST request to the API to add new members to the chat room.
   * @param {*} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Ensure empty request is not sent
    if (teacherEmails.length === 0) {
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/chats/${room.room_id}/teachers`,
        teacherEmails,
        {
          withCredentials: true,
        }
      );
      setTeacherEmails([]);
      if (response.status === 207) {
        // Construct the report to be shown in the information dialog box
        const failedEnrolments = response?.data?.failedEnrolments.join("  ");
        const successfulEnrolments =
          response?.data?.successfulEnrolments.join("  ");
        const duplicateEnrolments =
          response?.data?.duplicateEnrolments.join("  ");

        const enrolmentReportText = `${response?.data?.message} See below for details.\n\n
The following Teachers were successfully added:\n${successfulEnrolments}\n\n
The following Teachers had already been added to this chat:\n${duplicateEnrolments}\n\n
The following Teachers could not be found on the system:\n${failedEnrolments}`;

        setEnrolmentReport(enrolmentReportText);
      }
      if (response.status === 200) {
        setEnrolmentReport(response?.data?.message);
      }
      setShowEnrolmentReport(true);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error?.response?.data?.error || "Error: Enrolment failed"
      );
      setShowErrorMessage(true);
    }
  };

  /**
   * Handles adding new email addresses to the enrolment list
   *
   * @param {String} email
   * @returns {void}
   */
  const addToEnrolment = () => {
    if (teacherEmailInput === "") {
      return;
    }

    if (teacherEmails.includes(teacherEmailInput)) {
      alert("That Teacher has already been added to this enrolment!");
      return;
    }

    setTeacherEmails((prevNumbers) => [...prevNumbers, teacherEmailInput]);
    setTeacherEmailInput("");
  };

  const handleDelete = (emailToDelete) => {
    setTeacherEmails((prevEmails) =>
      prevEmails.filter((email) => email != emailToDelete)
    );
  };

  return (
    <Stack
      width="100%"
      direction={smallScreen ? "column" : "row"}
      justifyContent={!smallScreen && "space-evenly"}
      paddingTop="0.5rem"
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        onKeyUp={(e) => {
          e.key === "Enter" && e.preventDefault();
        }}
      >
        <Stack direction="row" justifyContent="center">
          <AddIcon sx={{ marginTop: "0.2rem", marginRight: "0.2rem" }} />
          <Typography
            component="h1"
            variant="h5"
            align="center"
            paddingBottom="1rem"
          >
            Add Teachers to Chat
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center">
          <TextField
            margin="normal"
            required
            fullWidth
            id="teacherEmail"
            label="Teacher Email"
            name="teacherEmail"
            type="email"
            autoFocus
            error={emailError}
            value={teacherEmailInput}
            onChange={handleEmailChange}
            InputProps={{
              sx: { borderTopRightRadius: "0", borderBottomRightRadius: "0" },
              startAdornment: (
                <InputAdornment position="start">
                  <AlternateEmailIcon />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Save and continue">
            <Button
              variant="contained"
              sx={{
                height: "3.5rem",
                marginTop: "0.45rem",
                borderTopLeftRadius: "0",
                borderBottomLeftRadius: "0",
              }}
              onClick={addToEnrolment}
              disabled={emailError}
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
          Submit
        </Button>
      </Box>

      {/* List of Teacher emails saved to this enrolment */}
      {teacherEmails.length > 0 && (
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

            {teacherEmails.map((teacherEmail) => {
              return (
                <Stack
                  key={teacherEmail}
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
                      {teacherEmail}
                    </Typography>
                    <Tooltip title="Remove from enrolment">
                      <Button
                        color="warning"
                        variant="contained"
                        sx={{
                          borderBottomLeftRadius: "0",
                          borderTopLeftRadius: "0",
                        }}
                        onClick={() => handleDelete(teacherEmail)}
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
        open={showEnrolmentReport}
        onClose={() => {
          setShowEnrolmentReport(false);
          setEnrolmentReport("");
        }}
        sx={{ whiteSpace: "pre-wrap" }}
      >
        <Alert
          severity="info"
          sx={{ width: "100%" }}
          onClose={() => {
            setShowEnrolmentReport(false);
            setEnrolmentReport("");
          }}
        >
          {enrolmentReport}
        </Alert>
      </Snackbar>

      {/* Notification containing error message if API returns an error status code */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showErrorMessage}
        onClose={() => {
          setShowErrorMessage(false);
          setErrorMessage("");
        }}
        sx={{ whiteSpace: "pre-wrap" }}
      >
        <Alert
          severity="error"
          sx={{ width: "100%" }}
          onClose={() => {
            setShowErrorMessage(false);
            setErrorMessage("");
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default TeacherEnrolmentForm;
