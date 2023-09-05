import { useMediaQuery, Stack, Typography, Fade, Button } from "@mui/material";
import TerminalIcon from "@mui/icons-material/Terminal";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../authentication/AuthProvider";

function LandingPage() {
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();
  const smallScreen = useMediaQuery("(max-width:600px)");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }

    setLoaded(true);
  }, []);

  return (
    <Stack
      height="100%"
      width="100%"
      paddingTop={"1.5rem"}
      alignItems="center"
      sx={{
        background:
          "linear-gradient(0deg, rgba(86,129,255,1) 0%, rgba(164,215,255,1) 33%, rgba(192,251,255,1) 66%, rgba(255,255,255,1) 100%)",
      }}
    >
      <Fade in={loaded} timeout={2000}>
        <Stack
          alignItems={"center"}
          sx={{
            backgroundColor: "rgba(92, 91, 91, 0.1)",
            borderRadius: "5px",
            padding: "1rem"
          }}
        >
          <Stack
            direction={"row"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <TerminalIcon sx={{ fontSize: "5rem" }} />

            <Typography variant="h2" fontWeight="bold" align="center">
              EduChan
            </Typography>
          </Stack>

          <Typography variant="h5" color="text.secondary" align="center">
            &apos;The Community Classroom&apos;
          </Typography>

          <video
            width={smallScreen ? "300" : "450"}
            autoPlay
            loop
            muted
            style={{ borderRadius: "20px", marginTop: "3rem" }}
          >
            <source src="/public/landingVideo.mp4" type="video/mp4" />
          </video>

          <Stack marginTop="5rem" width={"100%"}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ marginBottom: "3rem", borderRadius: "20px" }}
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              color="success"
              sx={{ marginBottom: "0.5rem", borderRadius: "20px" }}
              onClick={() => navigate("/register/student")}
            >
              Student Registration
            </Button>
            <Button
              variant="contained"
              color="success"
              sx={{borderRadius: "20px"}}
              onClick={() => navigate("/register/teacher")}
            >
              Teacher Registration
            </Button>
          </Stack>
        </Stack>
      </Fade>
    </Stack>
  );
}

export default LandingPage;
