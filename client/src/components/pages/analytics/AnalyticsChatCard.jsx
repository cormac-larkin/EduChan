import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
} from "@mui/material";
import { Link } from "react-router-dom";

function AnalyticsChatCard({ chat }) {

  const { room_id, title, creation_date, image_url } = chat;

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
        to={`/analytics/chats/${room_id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardActionArea>
          <CardMedia component="img" height="140" image={image_url} alt="pic" />
          <CardContent sx={{ pl: "0.6rem", pr: "0.2rem", pb: "0.2rem" }}>
            <Typography gutterBottom variant="h5" component="div">
              {title}
            </Typography>

            <Typography variant="body2" color="text.secondary" pt="0.2rem">
              {`Created: ${creation_date.slice(0, 10)}`}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Link>
      <CardActions
      >

      </CardActions>
    </Card>
  );
}

export default AnalyticsChatCard;
