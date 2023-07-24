import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {
  Box,
  Grid,
  Link,
  Snackbar,
  Alert,
  TextField,
  Paper,
  InputAdornment,
} from "@mui/material";
import MailLockIcon from "@mui/icons-material/MailLock";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import validateEmailAddress from "../../utils/validateEmailAddress";

function TeacherRegistrationForm() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [networkError, setNetworkError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const handleEmailChange = (e) => {
    const value = e.target.value;

    setEmail(value);
    setEmailError(!validateEmailAddress(value) && value !== "");
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;

    setPassword(value);
    setPasswordError(value.length < 8 && value !== "");
  };

  /**
   * Handles form submission for Teacher registrations via the API.
   *
   * @param {Event} event - The form submission event.
   * @returns {Promise<void>} A Promise that resolves after handling the form submission.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Ensure password and password confirmation fields match
    if (password !== passwordConfirmation) {
      return;
    }

    try {
      await axios.post("http://localhost:5000/users/teachers", {
        firstName,
        lastName,
        email,
        password,
        passwordConfirmation,
      });
      navigate("/login", {
        state: {
          message: "Registration Successful! Please contact your School Administrator to request account approval. Once approved, you may begin using your account.", // Pass success message to the login page so we can display notification
        },
      });
    } catch (error) {
      setNetworkError(
        error.response
          ? error.response.data.error
          : "An error occurred while registering"
      );
      setShowAlert(true);
      console.error(error.response.data.error); // Log the error message from the API
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        padding: "1rem",
        marginTop: "1rem",
        maxWidth: "500px",
      }}
    >
      <Typography component="h1" variant="h4" align="center">
        Create a Teacher Account
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="firstName"
          label="First Name"
          name="firstName"
          type="text"
          autoComplete="given-name"
          autoFocus
          inputProps={{ minLength: 1 }}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="lastName"
          label="Last Name"
          name="lastName"
          type="text"
          autoComplete="family-name"
          inputProps={{ minLength: 1 }}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          error={emailError}
          helperText={emailError && "Please enter a valid email address"}
          value={email}
          onChange={(e) => handleEmailChange(e)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MailLockIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="password"
          label="Password"
          name="password"
          type="password"
          autoComplete="password"
          inputProps={{ minLength: 8 }}
          error={passwordError}
          helperText={passwordError && "Must contain at least 8 characters"}
          value={password}
          onChange={(e) => handlePasswordChange(e)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="passwordConfirmation"
          label="Confirm Password"
          name="passwordConfirmation"
          type="password"
          error={password !== passwordConfirmation}
          helperText={
            password !== passwordConfirmation && "Passwords must match"
          }
          inputProps={{ minLength: 8 }}
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Register
        </Button>
        <Grid container display="flex" justifyContent="center">
          <Grid item>
            <Link href="/login" variant="body2">
              Already have an account? Log In
            </Link>
          </Grid>
        </Grid>
      </Box>

      {/* Error message if API call fails */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
      >
        <Alert
          severity="error"
          sx={{ width: "100%" }}
          onClose={() => setShowAlert(false)}
        >
          {networkError}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default TeacherRegistrationForm;
