import QRCode from "react-qr-code";
import { Modal, Backdrop, Fade, Stack, Box, Typography } from "@mui/material";

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

function QRCodeModal({ QRCodeModalOpen, setQRCodeModalOpen }) {
  const handleClose = () => {
    setQRCodeModalOpen(false);
  };

  return (
    <div>
      <Modal
        aria-labelledby="qr-code-modal"
        aria-describedby="this is the qr code to join the chatroom"
        open={QRCodeModalOpen}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={QRCodeModalOpen}>
          <Stack sx={{ ...style, maxWidth: "95vw", borderRadius: "5px" }}>
            <Box sx={{display: "flex", justifyContent: "center"}}>
              <QRCode value="test" />
            </Box>
            <Typography variant="h4" pt="2rem" align="center">
              Scan QR code to join!
            </Typography>
          </Stack>
        </Fade>
      </Modal>
    </div>
  );
}

export default QRCodeModal;
