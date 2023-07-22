import {
  Typography,
  Box,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { useState } from "react";
import axios from "axios";

function BatchEnrolmentForm({ room }) {
  const [csvFile, setCsvFile] = useState(null);
  const [showEnrolmentReport, setShowEnrolmentReport] = useState(false);
  const [enrolmentReport, setEnrolmentReport] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
  };

  /**
   * Handles the submission of the file upload form and displays the resulting API response.
   *
   * @param {*} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Do not allow empty uploads
    if (!csvFile) {
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", csvFile);

    try {
      const response = await axios.post(
        `http://localhost:5000/chats/${room.room_id}/students/batch`,
        formData,
        {
          withCredentials: true,
        }
      );
      if (response.status === 207) {
        // Construct the report to be shown in the information dialog box
        const failedEnrolments = response?.data?.failedEnrolments.join("  ");
        const successfulEnrolments =
          response?.data?.successfulEnrolments.join("  ");
        const duplicateEnrolments =
          response?.data?.duplicateEnrolments.join("  ");

        const enrolmentReportText = `${response?.data?.message} See below for details.\n\n\
The following Students were successfully enrolled:\n${successfulEnrolments}\n\n\
The following Students were already enrolled in this chat:\n${duplicateEnrolments}\n\n\
The following Students could not be found on the system:\n${failedEnrolments}`;

        setEnrolmentReport(enrolmentReportText);
      }
      if (response.status === 200) {
        setEnrolmentReport(response?.data?.message);
      }
      setShowEnrolmentReport(true);
    } catch (error) {
      console.error(error);
      setErrorMessage(error?.response?.data?.error || "Error: Enrolment failed");
      setShowErrorMessage(true);
    }
  };

  return (
    <Stack alignItems="center" paddingTop="0.5rem">
      <Stack direction="row">
        <FileUploadIcon sx={{ marginTop: "0.2rem", marginRight: "0.2rem" }} />
        <Typography component="h1" variant="h5" align="center">
          Upload a CSV File
        </Typography>
      </Stack>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          margin="normal"
          required
          id="fileUpload"
          label="CSV File"
          name="csvFile"
          type="file"
          autoFocus
          onChange={handleFileChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FileUploadIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Submit Enrolment
        </Button>
      </Box>

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

export default BatchEnrolmentForm;
