import { useState } from "react";
import { Menu, IconButton, MenuItem, Snackbar, Alert } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ChatPageKebabMenu({ room, onReadOnlyChange, setSelectorModalOpen }) {
  const navigate = useNavigate();

  // State to handle confirmation/success messages for setting room as read-only
  const [showReadOnlySuccessMessage, setShowReadOnlySuccessMessage] = useState(false);

  // State to handle confirmation/success messages for setting room as NOT read-only
  const [showNotReadOnlySuccessMessage, setShowNotReadOnlySuccessMessage] = useState(false);

  // States for handling showing error messages from the API
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false); 

  // Sets the room as read only
  const setAsReadOnly = async () => {
    try {
      await axios.put(
        `http://localhost:5000/chats/${room.room_id}/read-only`,
        { readOnly: true },
        { withCredentials: true }
      );
      handleClose();
      onReadOnlyChange(true); // Update state in parent component to cause a re-render - so 'read-only' badge appears
      setShowReadOnlySuccessMessage(true);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.error || "Error: Unable to set chat to read-only mode"
      );
      setShowErrorMessage(true);
    }
  };

  // Sets the room as NOT read only
   const setAsNotReadOnly = async () => {
    try {
      await axios.put(
        `http://localhost:5000/chats/${room.room_id}/read-only`,
        { readOnly: false },
        { withCredentials: true }
      );
      handleClose();
      onReadOnlyChange(false); // Update state in parent component to cause a re-render - so 'read-only' badge disappears
      setShowNotReadOnlySuccessMessage(true);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.error || "Error: Unable to disable read-only mode"
      );
      setShowErrorMessage(true);
    }
  };

  const menuItems = [
    { text: "Launch Quiz", onClick: () => {setSelectorModalOpen(true); handleClose()} },
    {
      text: "Enrol Students",
      onClick: () => navigate(`/chats/${room.room_id}/enrol`),
    },
    {
      text: room.read_only ? "Disable read only mode" : "Enable read only mode",
      onClick: room.read_only ? setAsNotReadOnly : setAsReadOnly
    },
  ];

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {menuItems.map((menuItem) => (
          <MenuItem key={menuItem.text} onClick={() => menuItem.onClick()}>
            {menuItem.text}
          </MenuItem>
        ))}
      </Menu>



      {/* Success notification upon setting room as 'read only' */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showReadOnlySuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowReadOnlySuccessMessage(false)}
        message={"Chat set to read-only successfully!"}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={() => setShowReadOnlySuccessMessage(false)}
        >
          {"Read-Only mode enabled!"}
        </Alert>
      </Snackbar>

      {/* Success notification upon setting room as  NOT 'read only' */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showNotReadOnlySuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowNotReadOnlySuccessMessage(false)}
        message={"Chat set to read-only successfully!"}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={() => setShowNotReadOnlySuccessMessage(false)}
        >
          {"Read-Only mode disabled!"}
        </Alert>
      </Snackbar>

      {/* Error notification if an API call fails */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showErrorMessage}
        autoHideDuration={6000}
        onClose={() => setShowErrorMessage(false)}
        message={errorMessage}
      >
        <Alert
          severity="error"
          sx={{ width: "100%" }}
          onClose={() => setShowErrorMessage(false)}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ChatPageKebabMenu;
