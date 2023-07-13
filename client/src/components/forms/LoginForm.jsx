import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthProvider";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {
  Box,
  Grid,
  Link,
  Snackbar,
  Alert,
  Paper,
  InputAdornment,
} from "@mui/material";
import MailLockIcon from "@mui/icons-material/MailLock";
import LockIcon from "@mui/icons-material/Lock";
import TextField from "@mui/material/TextField";
import validateEmailAddress from "../../utils/validateEmailAddress";

function LoginForm() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [networkError, setNetworkError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(!validateEmailAddress(value) && value !== ""); // Set emailError to true if the entered email address fails validation
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(value.length < 8 && value !== "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent page reload

    try {
      const response = await axios.post(
        "http://localhost:5000/auth/login",
        { email, password },
        {
          withCredentials: true,
        }
      );

      setUser(response.data); // Use the API response to set the global Auth Context (So we know which user is logged in and their role/permissions)

      // Upon successful login, redirect user to the appropriate Dashboard page
      if (response.data.isTeacher) {
        navigate("/dashboard/teacher");
      } else {
        navigate("/dashboard/student");
      }
    } catch (error) {
      setNetworkError(error.response.data.error);
      setShowAlert(true);
      console.error(error.response.data.error); // Log the error message from the API
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        padding: "1rem",
        marginTop: "4rem",
        maxWidth: "500px",
      }}
    >
      <Typography
        component="h1"
        variant="h4"
        align="center"
        paddingBottom="1rem"
      >
        Sign in
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
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
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          error={passwordError}
          helperText={passwordError && "Must contain at least 8 characters"}
          value={password}
          onChange={(e) => handlePasswordChange(e)}
          inputProps={{
            minLength: 8,
          }}
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
          Sign In
        </Button>
        <Grid container display="flex" justifyContent="center">
          <Grid item>
            <Link href="#" variant="body2">
              Don&#39;t have an account? Sign Up
            </Link>
          </Grid>
        </Grid>
      </Box>
      <Snackbar
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

export default LoginForm;
