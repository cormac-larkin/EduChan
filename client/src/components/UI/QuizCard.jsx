import { useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
} from "@mui/material";

function QuizCard({ quiz, hasReportLink }) {
  const { quiz_id, title, description, image_url } = quiz;

  const smallScreen = useMediaQuery("(max-width:500px)");

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
        to={hasReportLink ? `/quizzes/${quiz_id}/report` : `/quizzes/${quiz_id}/edit`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardActionArea>
          <CardMedia component="img" height="140" image={image_url} alt="pic" />
          <CardContent sx={{ pl: "0.6rem", pr: "0.2rem", pb: "0.2rem" }}>
            <Typography gutterBottom variant="h5" component="div">
              {title}
            </Typography>

            <Typography variant="body2" color="text.secondary" pt="0.2rem">
              {`${description}`}
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
      ></CardActions>
    </Card>
  );
}

export default QuizCard;
