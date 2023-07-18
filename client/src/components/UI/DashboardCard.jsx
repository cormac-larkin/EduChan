import {
  Card,
  CardMedia,
  CardContent,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function DashboardCard({ card }) {
  const { title, description, imageURI, href } = card;
  const navigate = useNavigate();

  return (
    <Card sx={{ maxWidth: 345, width: "100%", cursor: "pointer" }} elevation={6} onClick={() => navigate(href)}>
        <CardMedia sx={{ height: 140 }} image={imageURI} title={title} />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
    </Card>
  );
}

export default DashboardCard;
