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
  CircularProgress,
  Accordion,
  AccordionSummary,
  ListItem,
  Button,
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
import FilterDramaIcon from "@mui/icons-material/FilterDrama";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";
import SummarizeIcon from "@mui/icons-material/Summarize";
import SentimentAnalysisChart from "./SentimentAnalysisChart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CommentIcon from "@mui/icons-material/Comment";
import InsightsIcon from "@mui/icons-material/Insights";
import PromptInsightsModal from "./PromptInsightsModal";

function ChatAnalyticsPage() {
  const smallScreen = useMediaQuery("(max-width:800px)");
  const { roomID } = useParams(); // Get the roomID from the URL parameter

  // State to hold the analytics data retrieved from the API
  const [analyticsData, setAnalyticsData] = useState();
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // States to hold the sentiment analysis data retrieved from the API
  const [positiveSentiment, setPositiveSentiment] = useState(0);
  const [neutralSentiment, setNeutralSentiment] = useState(0);
  const [negativeSentiment, setNegativeSentiment] = useState(0);
  const [loadingSentiments, setLoadingSentiments] = useState(true);

  // States to hold the prompt reports retrieved from the API
  const [promptReports, setPromptReports] = useState();
  const [loadingPromptReports, setLoadingPromptReports] = useState(true);

  // States to handle the insights data and the modal to display it
  const [insightsData, setInsightsData] = useState();
  const [insightsModalOpen, setInsightsModalOpen] = useState(false);

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/chats/${roomID}/analytics`,
        { withCredentials: true }
      );
      setAnalyticsData(response?.data);
      setLoadingAnalytics(false);
    } catch (error) {
      setAnalyticsData(null);
      setLoadingAnalytics(false);
      console.error(error);
    }
  };

  const fetchSentiments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/chats/${roomID}/sentiment`,
        { withCredentials: true }
      );

      setPositiveSentiment(response.data.positivePercentage);
      setNeutralSentiment(response.data.neutralPercentage);
      setNegativeSentiment(response.data.negativePercentage);
      setLoadingSentiments(false);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPromptReports = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/chats/${roomID}/prompts`,
        { withCredentials: true }
      );
      setLoadingPromptReports(false);
      setPromptReports(response?.data);
      console.log(response?.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInsightData = async (promptID) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/prompts/${promptID}/insights`,
        { withCredentials: true }
      );
      setInsightsData(response?.data?.insights);
    } catch (error) {
      console.error(error);
      setInsightsData("Sorry, we are currently unable to generate insights, please try again later")
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    fetchPromptReports();
    fetchSentiments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadingAnalytics || loadingPromptReports) {
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
            <Box
              width={smallScreen ? "100%" : "60%"}
              display="flex"
              flexDirection="column"
              alignItems="center"
              pl={!smallScreen && "0.5rem"}
            >
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                pb="0.3rem"
              >
                <PsychologyAltIcon />
                <Typography
                  sx={{ flexShrink: 0, pl: "0.7rem" }}
                  component="h1"
                  variant="h5"
                  align="center"
                >
                  Sentiment Analysis
                </Typography>
              </Stack>
              <Divider sx={{ width: "100%", mr: "1rem", ml: "1rem" }} />
              <Stack height="100%" justifyContent="center" alignItems="center">
                {loadingSentiments ? (
                  <Stack pt="0.5rem">
                    <CircularProgress size="md" thickness={1} />
                    <Typography mt="1rem">
                      Performing analysis, please wait...
                    </Typography>
                  </Stack>
                ) : (
                  <SentimentAnalysisChart
                    positivePercentage={positiveSentiment}
                    neutralPercentage={neutralSentiment}
                    negativePercentage={negativeSentiment}
                    analyticsData={analyticsData}
                  />
                )}
              </Stack>
            </Box>
          </Stack>
          <Divider sx={{ width: "100%", mt: "1rem", mb: "0.5rem" }} />
        </Stack>
        <Box width="100%">
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            pb="0.3rem"
          >
            <FilterDramaIcon />
            <Typography
              sx={{ flexShrink: 0, pl: "0.7rem" }}
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
              const maxHeight = 500;
              const maxWidth = 800;
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
      </Paper>

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
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          pb="0.3rem"
        >
          <SummarizeIcon />
          <Typography
            sx={{ flexShrink: 0, pl: "0.7rem" }}
            component="h1"
            variant="h5"
            align="center"
          >
            Prompt Reports
          </Typography>
        </Stack>

        {promptReports[0]?.result?.map((prompt, index) => {
          const { prompt_id, content, responses } = prompt;

          return (
            <Accordion
              key={index}
              elevation={6}
              disableGutters
              sx={{ ...paperStyles, borderRadius: "5px", width: "100%" }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
                sx={{ borderBottom: "1px solid grey" }}
              >
                <Typography
                  sx={{ width: "75%", flexShrink: 0 }}
                  component="h1"
                  variant="h5"
                >
                  {content}
                </Typography>
              </AccordionSummary>
              <List>
                <ListItem key={index}>
                  <Button
                    variant="contained"
                    startIcon={<InsightsIcon />}
                    disabled={responses[0]?.content === null}
                    onClick={() => {
                      setInsightsData("");
                      fetchInsightData(prompt_id);
                      setInsightsModalOpen(true);
                    }}
                  >
                    Generate Insights
                  </Button>
                </ListItem>
                <Divider />
                {responses.map((response, index) => {
                  return (
                    <ListItemButton key={index}>
                      <ListItemIcon>
                        <CommentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          response.content || "No responses available..."
                        }
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Accordion>
          );
        })}
      </Paper>

      {/* Modal to display Prompt Insights Data */}
      <PromptInsightsModal
        insightsModalOpen={insightsModalOpen}
        setInsightsModalOpen={setInsightsModalOpen}
        insightsData={insightsData}
        setInsightsData={setInsightsData}
      />
    </Stack>
  );
}

export default ChatAnalyticsPage;
