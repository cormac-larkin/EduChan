import { Stack, Paper, Typography, Divider } from "@mui/material";
import paperStyles from "../../../styles/paperStyles";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import WordCloud from "./WordCloud";

function ChatAnalyticsPage() {
  const { roomID } = useParams(); // Get the roomID from the URL parameter

  // State to hold the word cloud data retreived from the API
  const [wordCloudData, setWordCloudData] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchWordCloudData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/chats/${roomID}/word-cloud`,
        { withCredentials: true }
      );
      // Loading etc etc
      setWordCloudData(response?.data?.wordCloudData)
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchWordCloudData();
  }, [])

  return (
    <Stack>
      <Stack p="1rem" direction="row">
        <Stack justifyContent="center">
          <BarChartIcon />
        </Stack>
        <Stack pl="0.5rem">
          <Typography component="h1" variant="h5" align="left">
            <b>{`Analytics: ${"<CHAT NAME>"}`}</b>
          </Typography>
        </Stack>
      </Stack>
      <Divider />

      <Paper
        elevation={6}
        sx={{
          ...paperStyles,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "0.5rem",
        }}
      >
        <WordCloud inputWords={wordCloudData} width={500} height={500} showControls={true}/>
      </Paper>
    </Stack>
  );
}

export default ChatAnalyticsPage;
