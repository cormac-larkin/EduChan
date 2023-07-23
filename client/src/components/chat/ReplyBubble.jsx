import { Stack, Tooltip, Typography, useMediaQuery, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReplyIcon from "@mui/icons-material/Reply";
import { useTheme } from "@emotion/react";

const blue = {
  100: "#DAECFF",
  200: "#b6daff",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  900: "#003A75",
};

const grey = {
  50: "#f6f8fa",
  100: "#eaeef2",
  200: "#d0d7de",
  300: "#afb8c1",
  400: "#8c959f",
  500: "#6e7781",
  600: "#57606a",
  700: "#424a53",
  800: "#32383f",
  900: "#24292f",
};

function ReplyBubble({ messageID, messageContent, onClose, innerBubble }) {
  const theme = useTheme();
  const medScreen = useMediaQuery("(min-width:700px)");

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={!innerBubble ? { // Apply different styles if this bubble is nested within another bubble
        border: `1px solid ${
          theme.palette.mode === "dark" ? grey[700] : grey[200]
        }`,
        borderTopLeftRadius: "30px",
        borderTopRightRadius: "30px",
        padding: "0.8rem",
      } : {}}
    >
      <Stack
        direction="row"
        bgcolor={theme.palette.secondary.light}
        borderRadius="10px"
        minWidth="70%"
      >
        <ReplyIcon sx={{ color: "black" }} />
        <Stack pl="0.3rem" width="100%">
            <Typography 
                 width="100%"
                bgcolor={theme.palette.mode === "light" ? theme.palette.grey[300] : theme.palette.grey[800]}
                borderRadius="0 10px 0 0"
                color={theme.palette.mode === "light" ? "black" : "white"}
                p="0.2rem 0.5rem">
                {`Replying to #${messageID}`}
            </Typography>
            <Divider />
            <Typography
                width="100%"
                bgcolor={theme.palette.mode === "light" ? theme.palette.grey[300] : theme.palette.grey[800]}
                borderRadius="0 0 10px 0"
                color={theme.palette.mode === "light" ? "black" : "white"}
                p="0.2rem 0.5rem"
            >
                {/* Show more or less of the parent message depending on the screen size */}
            <i>{`${medScreen ? messageContent.slice(0, 150) : messageContent.slice(0, 50)}...`}</i>
            </Typography> 
        </Stack>
      </Stack>
      <Tooltip title="Close reply">
        <CloseIcon onClick={onClose} sx={{ cursor: "pointer" }} />
      </Tooltip>
    </Stack>
  );
}

export default ReplyBubble;
