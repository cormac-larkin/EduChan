import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../authentication/AuthProvider";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {
  Box,
  Grid,
  Snackbar,
  Alert,
  Paper,
  InputAdornment,
} from "@mui/material";
import MailLockIcon from "@mui/icons-material/MailLock";
import LockIcon from "@mui/icons-material/Lock";
import TextField from "@mui/material/TextField";
import validateEmailAddress from "../../../utils/validateEmailAddress";

function LoginForm() {
  const { login } = useContext(AuthContext);
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
    event.preventDefault();

    try {
      await login(email, password);
      navigate("/dashboard", {
        state: { message: "Login Successful!" },
      });
    } catch (error) {
      console.error(error);
      setNetworkError(error.message);
      setShowAlert(true);
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
            <Link to={"/"}>
              <Typography color={"primary"}>Don&#39;t have an account? Sign Up</Typography>
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

export default LoginForm;
