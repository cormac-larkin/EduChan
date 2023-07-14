import { useLocation } from "react-router-dom";
import LoginForm from "../forms/LoginForm";
import Snackbar from "@mui/material/Snackbar";
import { useEffect, useState } from "react";
import { Alert } from "@mui/material";

function LoginPage() {
  const location = useLocation();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    // On first render, check if a success message was passed from the RegistrationPage component
    // If so, save it in the 'succcessMessage' state, then set the 'showSuccessMessage' state to true so it will be displayed
    if (location.state && location.state.registrationSuccessMessage) {
      setSuccessMessage(location.state.registrationSuccessMessage);
      setShowSuccessMessage(true);
      window.history.replaceState(null, ''); // Clear the history state after the message is retrieved
    }
  }, [location]);

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowSuccessMessage(false)}
        message={successMessage}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={() => setShowSuccessMessage(false)}
        >
          {successMessage}
        </Alert>
      </Snackbar>
      <LoginForm />
    </>
  );
}

export default LoginPage;
