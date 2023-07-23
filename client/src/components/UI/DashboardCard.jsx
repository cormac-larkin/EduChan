import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActionArea,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function DashboardCard({ card }) {
  const { title, description, imageURI, href } = card;
  const navigate = useNavigate();

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
      onClick={() => navigate(href)}
    >
      <CardMedia sx={{ height: 140 }} image={imageURI} title={title} />
      <CardContent sx={{paddingLeft: "0.5rem", paddingRight: "0.2rem"}}>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
      </CardContent>
      <CardActionArea sx={{padding: "0.5rem"}}>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardActionArea>
    </Card>
  );
}

export default DashboardCard;
