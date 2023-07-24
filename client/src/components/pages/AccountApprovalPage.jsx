import { Stack, Paper, Divider, Typography, Snackbar, Alert } from "@mui/material";
import paperStyles from "../../styles/paperStyles";
import AddModeratorIcon from "@mui/icons-material/AddModerator";
import { useEffect, useState } from "react";
import axios from "axios";
import ApprovalList from "../UI/ApprovalList";

function AccountApprovalPage() {
  // State to hold accounts which require approval
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approved, setApproved] = useState([]);

  // State to handle showing approval success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // States to handle API errors and displaying error notifications
  const [errorMessage, setErrorMessage] = useState(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const handleToggle = (email) => {
    if (approved.includes(email)) {
      setApproved(approved.filter((emailAddress) => emailAddress !== email));
    } else {
      setApproved([...approved, email]);
    }
  };

  const fetchApprovals = async () => {
    try {
      const response = await axios.get("http://localhost:5000/users", {
        withCredentials: true,
      });
      const unApprovedAccounts = response?.data?.filter(
        (account) => !account.is_approved
      );
      setPendingApprovals(unApprovedAccounts);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error?.response?.data?.error ||
          "Error: Unable to retrieve approval requests"
      );
      setShowErrorMessage(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(approved.length === 0) {
        return;
    }

    try {
      await axios.post(
        `http://localhost:5000/users/approve`,
        { approvedEmails: approved },
        {
          withCredentials: true,
        }
      );
      setShowSuccessMessage(true);
      fetchApprovals();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error?.response?.data?.error || "Error: Unable to submit approvals"
      );
      setShowErrorMessage(true);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  return (
    <Stack>
      <Stack p="1rem" direction="row">
        <Stack justifyContent="center">
          <AddModeratorIcon />
        </Stack>

        <Typography component="h1" variant="h5" align="left" pl="0.5rem">
          <b>{"Manage Approval Requests"}</b>
        </Typography>
      </Stack>
      <Divider />

      <Paper
        elevation={6}
        sx={{
          ...paperStyles,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "0.5rem",
        }}
      >
        <ApprovalList
          pendingApprovals={pendingApprovals}
          approved={approved}
          onChange={handleToggle}
          onSubmit={handleSubmit}
        />
      </Paper>

      {/* Success message for successful approvals */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowSuccessMessage(false)}
        message={"Approval Successful!"}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={() => setShowSuccessMessage(false)}
        >
          {"Approval Successful!"}
        </Alert>
      </Snackbar>

      {/* Error message for failed API calls */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showErrorMessage}
        autoHideDuration={6000}
        onClose={() => setShowErrorMessage(false)}
        message={errorMessage}
      >
        <Alert
          severity="error"
          sx={{ width: "100%" }}
          onClose={() => setShowErrorMessage(false)}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default AccountApprovalPage;
