import {
  Card,
  CardActionArea,
  CardActions,
  CardMedia,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../authentication/AuthProvider";

function ChatCard({ chat, onDeleteSelection }) {
  const { user } = useContext(AuthContext);
  const { room_id, title, creation_date, member_id } = chat;

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
            image="https://picsum.photos/300"
            alt="pic"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`Created: ${creation_date.slice(0, 10)}`}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Link>
      <CardActions>
        {/* Include a 'Delete' button if the current User owns this chat */}
        {user.id === member_id && (
          <Button
            size="small"
            color="error"
            onClick={() => onDeleteSelection(chat)}
          >
            Delete Room
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

export default ChatCard;
