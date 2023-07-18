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

  return (
    <Card sx={{ maxWidth: 345 }} elevation={6}>
      <Link
        to={`/chats/${chat.room_id}`}
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
              {chat.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A brief description of the Chat Room
            </Typography>
          </CardContent>
        </CardActionArea>
      </Link>
      <CardActions>
        {user.id === chat.member_id && (
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
