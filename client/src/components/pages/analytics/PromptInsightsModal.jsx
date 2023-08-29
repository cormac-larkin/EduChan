import Backdrop from "@mui/material/Backdrop";
import Stack from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import { Button, CircularProgress, Divider, Box } from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";

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

function PromptInsightsModal({
  insightsModalOpen,
  setInsightsModalOpen,
  insightsData,
  setInsightsData,
}) {
  const handleClose = () => {
    setInsightsModalOpen(false);
    setInsightsData("");
  };

  return (
    <div>
      <Modal
        aria-labelledby="qr-code-modal"
        aria-describedby="this is the qr code to join the chatroom"
        open={insightsModalOpen}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={insightsModalOpen}>
          <Stack sx={{ ...style, maxWidth: "95vw", borderRadius: "5px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <InsightsIcon sx={{paddingTop: "0.5rem"}} />
                <Typography variant="h5" align="center" pb={"0.3rem"}>
                  {"Insights"}
                </Typography>
              </Box>
              <Divider width="100%" sx={{ marginBottom: "1rem" }} />
              {insightsData ? (
                <Typography variant="text.secondary" pt="0.5rem" align="center">
                  {insightsData}
                </Typography>
              ) : (
                <>
                  <CircularProgress />
                  <Typography pt="2rem">Generating insights...</Typography>
                  <Typography variant="text.secondary">
                    Please wait, this may take a while!
                  </Typography>
                </>
              )}
              <br />
              <br />
              <Button variant="contained" onClick={handleClose}>
                Close
              </Button>
            </div>
          </Stack>
        </Fade>
      </Modal>
    </div>
  );
}

export default PromptInsightsModal;
