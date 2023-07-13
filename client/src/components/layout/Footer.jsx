import { Box, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        boxSizing: "border-box",
        padding: "20px",
        textAlign: "center",
        mt: "auto", // Push the footer to the bottom of the page
      }}
    >
      <Typography variant="body2" color="grey">
        &copy; 2023 EduChan
      </Typography>
    </Box>
  );
}

export default Footer;
