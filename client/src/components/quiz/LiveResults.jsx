import { Typography, Fade, Backdrop, Modal, Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import LoadingSpinnerPage from "../pages/error/LoadingSpinnerPage";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function LiveResults({
  socket,
  quiz,
  activeUsers,
  setActiveUsers,
  resultsModalOpen,
  setResultsModalOpen,
}) {
  useEffect(() => {
    if (socket) {
      console.log("socket");
    }
  }, [socket]);

  if (!socket) {
    // Show loading spinner while socket is being initialised
    return <LoadingSpinnerPage />;
  }

  return (
    <div>
      <Modal
        keepMounted={true}
        aria-labelledby="quiz-selector-modal"
        aria-describedby="select the quiz to launch in the chatroom"
        open={resultsModalOpen}
        onClose={() => setResultsModalOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={resultsModalOpen}>
          <Box
            component="form"
            sx={{ ...style, maxWidth: "95vw", borderRadius: "5px" }}
          >
            <Typography
              id="transition-modal-title"
              variant="h6"
              component="h2"
              mb="1rem"
            >
              Live Results
            </Typography>
            {`Participants: ${activeUsers}`}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              End Quiz
            </Button>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}

export default LiveResults;
