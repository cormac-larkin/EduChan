import {
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
import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../authentication/AuthProvider";
import { useTheme } from "@emotion/react";

function ChatCard({
  chat,
  onDeleteSelection,
  onHideSelection,
  onUnhideSelection,
}) {
  const theme = useTheme();
  const smallScreen = useMediaQuery("(max-width:500px)");
  const { user } = useContext(AuthContext);
  const { room_id, title, creation_date, member_id, description, image_url } =
    chat;

  return (
    <Card
      sx={{ maxWidth: 345, width: "100%", cursor: "pointer" }}
      elevation={6}
    >
      <Link
        to={`/chats/${room_id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardActionArea>
          <CardMedia
            component="img"
            height="140"
            image={image_url} 
            alt="pic"
          />
          <CardContent>
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
            <Typography variant="body2" color="text.secondary">
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
        {/* Include a 'Delete' button if the current User owns this chat */}
        {user.id === member_id && (
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => onDeleteSelection(chat)}
            startIcon={<DeleteIcon />}
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
            sx={{
              marginLeft: smallScreen && "0px !important",
              marginTop: smallScreen && "0.2rem !important",
            }}
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
            sx={{
              marginLeft: smallScreen && "0px !important",
              marginTop: smallScreen && "0.2rem !important",
            }}
          >
            Re-activate
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

export default ChatCard;
