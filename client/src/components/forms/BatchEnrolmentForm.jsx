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
  const [showAlert, setShowAlert] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

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
        setApiResponse(
          `${response?.data?.message} See below for details. \n\nThe following students were successfully enrolled: [${response?.data?.successfulEnrolments}]\n\nThe following students were already enrolled in this chat: [${response?.data?.duplicateEnrolments}]\n\nThe following students could not found on the system: [${response?.data?.failedEnrolments}]`
        );
      }
      if (response.status === 200) {
        setApiResponse(response?.data?.message);
      }
      setShowAlert(true);
    } catch (error) {
      console.error(error);
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
        open={showAlert}
        onClose={() => {
          setShowAlert(false);
          setApiResponse("");
        }}
        sx={{ whiteSpace: "pre-wrap" }}
      >
        <Alert
          severity="info"
          sx={{ width: "100%" }}
          onClose={() => {
            setShowAlert(false);
            setApiResponse("");
          }}
        >
          {apiResponse}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default BatchEnrolmentForm;
