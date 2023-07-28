import {
  Stack,
  Card,
  CardActionArea,
  CardActions,
  CardMedia,
  CardContent,
  Typography,
  Button,
  useMediaQuery,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArchiveIcon from "@mui/icons-material/Archive";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CommentsDisabledIcon from "@mui/icons-material/CommentsDisabled";
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';
import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../authentication/AuthProvider";
import { useTheme } from "@emotion/react";

function ChatCard({
  chat,
  onDeleteSelection,
  onHideSelection,
  onUnhideSelection,
  onReadOnlySelection,
  onNotReadOnlySelection
}) {
  const theme = useTheme();
  const smallScreen = useMediaQuery("(max-width:500px)");
  const { user } = useContext(AuthContext);
  const { room_id, title, creation_date, member_id, image_url } = chat;

  return (
    <Card
      sx={{
        maxWidth: 345,
        width: "100%",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      elevation={6}
    >
      <Link
        to={`/chats/${room_id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardActionArea>
          <CardMedia component="img" height="140" image={image_url} alt="pic" />
          <CardContent sx={{ pl: "0.6rem", pr: "0.2rem", pb: "0.2rem" }}>
            <Typography gutterBottom variant="h5" component="div">
              {title}
            </Typography>
            
              {/* Mark hidden chats as 'Archived' */}
              {chat.hidden && (
                <Typography
                  variant="body2"
                  color={theme.palette.warning.contrastText}
                  bgcolor={theme.palette.warning.main}
                  borderRadius="5px"
                  pl="0.2rem"
                  maxWidth="4rem"
                >
                  Archived
                </Typography>
              )}
              {/* Mark non-hidden chats as 'Active' */}
              {!chat.hidden && (
                <Typography
                  variant="body2"
                  color={theme.palette.success.contrastText}
                  bgcolor={theme.palette.success.main}
                  borderRadius="5px"
                  pl="0.2rem"
                  maxWidth="4rem"
                >
                  Active
                </Typography>
              )}
              {/* Mark read-only chats as 'Read Only' */}
              {chat.read_only && (
                <Typography
                  variant="body2"
                  color={theme.palette.info.contrastText}
                  bgcolor={theme.palette.info.main}
                  borderRadius="5px"
                  pl="0.2rem"
                  mt="0.2rem"
                  maxWidth="6rem"
                >
                  Read-Only
                </Typography>
              )}
            
            <Typography variant="body2" color="text.secondary" pt="0.2rem">
              {`Created: ${creation_date.slice(0, 10)}`}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Link>
      <CardActions
        sx={{
          display: "flex",
          flexDirection: smallScreen ? "column" : "row",
          alignItems: smallScreen && "flex-start",
        }}
      >
        <Stack width="100%">
          {/* Include a 'Delete' button if the current User owns this chat */}
          {user.id === member_id && (
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() => onDeleteSelection(chat)}
              startIcon={<DeleteIcon />}
              sx={{margin: "0.1rem 0"}}
            >
              Delete
            </Button>
          )}

          {/* Include an 'Archive' button if the current User owns this chat and it is not already hidden */}
          {user.id === member_id && !chat.hidden && (
            <Button
              size="small"
              color="warning"
              variant="outlined"
              onClick={() => onHideSelection(chat)}
              startIcon={<ArchiveIcon />}
              sx={{margin: "0.1rem 0"}}
            >
              Archive
            </Button>
          )}

          {/* Include a 'Reactivate' button if the current User owns this chat and it is not already hidden */}
          {user.id === member_id && chat.hidden && (
            <Button
              size="small"
              color="info"
              variant="outlined"
              onClick={() => onUnhideSelection(chat)}
              startIcon={<VisibilityIcon />}
              sx={{margin: "0.1rem 0"}}
            >
              Re-activate
            </Button>
          )}

          {/* Include an 'Enable Read Only' button if the current User owns this chat and it is not already set as read-only */}
          {user.id === member_id && !chat.read_only && (
            <Button
              size="small"
              color="info"
              variant="outlined"
              onClick={() => onReadOnlySelection(chat)}
              startIcon={<CommentsDisabledIcon />}
              sx={{margin: "0.1rem 0"}}
            >
              Enable Read-Only
            </Button>
          )}

          {/* Include a 'Disable Read-Only' button if the current User owns this chat and it is not already set as read-only */}
          {user.id === member_id && chat.read_only && (
            <Button
              size="small"
              color="info"
              variant="outlined"
              onClick={() => onNotReadOnlySelection(chat)}
              startIcon={<MarkChatReadIcon />}
              sx={{margin: "0.1rem 0"}}
            >
              Disable Read-Only
            </Button>
          )}
        </Stack>
      </CardActions>
    </Card>
  );
}

export default ChatCard;
