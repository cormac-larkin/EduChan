import { Card, CardMedia, CardContent, Typography, } from "@mui/material"

function DashboardCard({card}) {

    const {title, description, imageURI } = card;

  return (
    <Card sx={{ maxWidth: 345, width: "100%" }}>
      <CardMedia
        sx={{ height: 140 }}
        image={imageURI}
        title="icon"
        
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default DashboardCard