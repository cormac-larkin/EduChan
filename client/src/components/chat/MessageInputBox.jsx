import { useRef, useEffect } from "react";
import TextareaAutosize from "@mui/base/TextareaAutosize";
import { styled } from "@mui/system";

export default function MessageInputBox({ room, onChange, value, cursorPositionRef, isReply }) {
  const textAreaRef = useRef(null);

  // Update the textarea value and set the cursor position to its previous when the component re-renders
  // This is a workaround for the issue of the losing the cursor position every time we type something, due to the component re-rendering
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.value = value;
      textAreaRef.current.selectionStart = textAreaRef.current.selectionEnd =
        cursorPositionRef.current;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

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

  const StyledTextarea = styled(TextareaAutosize)(
    ({ theme }) => `
    width: 320px;
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 12px;
    border-radius: 12px;
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
    background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
    border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
    box-shadow: 0px 2px 2px ${
      theme.palette.mode === "dark" ? grey[900] : grey[50]
    };

    border-radius: 30px;
    width: 100%;
    resize: none;
    margin-right: 0.5rem;

    ${isReply && 'border-top-left-radius: 0px; border-top-right-radius: 0px;'}
  
    &:hover {
      border-color: ${blue[400]};
    }
  
    &:focus {
      // border-color: ${blue[400]};
     // box-shadow: 0 0 0 3px ${
        theme.palette.mode === "dark" ? blue[500] : blue[200]
      };
    }
  
    // firefox
    &:focus-visible {
      outline: 0;
    }
  `
  );

  return (
    <StyledTextarea
      ref={textAreaRef}
      disabled={room.read_only} // Disable the input box if the room is set as read-only
      maxRows={4}
      aria-label="empty textarea"
      placeholder={room.read_only ? "Message posting disabled. Room set to read-only" : "Message"}
      onChange={onChange}
      value={value}
      autoFocus={true}
      id="messageInput"
    />
  );
}
