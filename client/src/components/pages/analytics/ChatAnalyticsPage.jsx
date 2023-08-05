import {
  Stack,
  Paper,
  Box,
  Typography,
  Divider,
  useMediaQuery,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import paperStyles from "../../../styles/paperStyles";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import WordCloud from "./WordCloud";
import { ParentSize } from "@visx/responsive";
import LoadingSpinnerPage from "../error/LoadingSpinnerPage";
import Error404Page from "../error/Error404Page";
import formatTimestamp from "../../../utils/formatTimestamp";
import SchoolIcon from "@mui/icons-material/School";
import MessageIcon from "@mui/icons-material/Message";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import FilterDramaIcon from '@mui/icons-material/FilterDrama';

function ChatAnalyticsPage() {
  const smallScreen = useMediaQuery("(max-width:800px)");
  const { roomID } = useParams(); // Get the roomID from the URL parameter

  // State to hold the word cloud data retreived from the API
  const [analyticsData, setAnalyticsData] = useState();
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/chats/${roomID}/analytics`,
        { withCredentials: true }
      );
      setAnalyticsData(response?.data);
      setLoading(false);
    } catch (error) {
      setAnalyticsData(null);
      setLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return <LoadingSpinnerPage />;
  }

  if (analyticsData === null) {
    return <Error404Page />;
  }

  return (
    <Stack>
      <Stack p="1rem" direction="row">
        <Stack justifyContent="center">
          <BarChartIcon />
        </Stack>
        <Stack pl="0.5rem">
          <Typography component="h1" variant="h5" align="left">
            <b>{`Analytics: ${analyticsData?.title}`}</b>
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
        <Stack width="100%">
          <Stack direction={smallScreen ? "column" : "row"}>
            <Box
              width={smallScreen ? "100%" : "40%"}
              pr={"0.5rem"}
              borderRight={!smallScreen && "1px solid grey"}
            >
              <img
                src={analyticsData.image_url}
                width="100%"
                style={{ borderRadius: "5px" }}
              ></img>
              <List dense>
                <ListItemButton>
                  <ListItemIcon>
                    <SchoolIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Students Enrolled`}
                    secondary={`${analyticsData.memberCount}`}
                  />
                </ListItemButton>
                <Divider />

                <ListItemButton>
                  <ListItemIcon>
                    <MessageIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Messages Posted`}
                    secondary={` ${analyticsData.messageCount}`}
                  />
                </ListItemButton>
                <Divider />

                <ListItemButton>
                  <ListItemIcon>
                    <RocketLaunchIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Date Opened`}
                    secondary={`${analyticsData.creation_date.substring(
                      0,
                      10
                    )}`}
                  />
                </ListItemButton>
                <Divider />

                <ListItemButton>
                  <ListItemIcon>
                    <AccessTimeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Last Active`}
                    secondary={` ${formatTimestamp(
                      analyticsData.lastMessageTime
                    )}`}
                  />
                </ListItemButton>
                <Divider />
              </List>
            </Box>
            <Box width={smallScreen ? "100%" : "60%"}>
              <Stack direction="row" justifyContent="center" alignItems="center" pb="0.3rem">
                <FilterDramaIcon />
                <Typography
                  sx={{flexShrink: 0, pl: "0.7rem" }}
                  component="h1"
                  variant="h5"
                  align="center"
                >
                  Word Cloud
                </Typography>
              </Stack>
              <Divider sx={{ width: "100%" }} />
              <ParentSize>
                {({ width, height }) => {
                  const maxHeight = 400;
                  const maxWidth = 600;
                  const h = Math.min(height, maxHeight);
                  const w = Math.min(width, maxWidth);
                  return (
                    <WordCloud
                      inputWords={analyticsData?.wordCloudData}
                      width={w}
                      height={h}
                      showControls={true}
                      smallScreen={smallScreen}
                    />
                  );
                }}
              </ParentSize>
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}

export default ChatAnalyticsPage;
