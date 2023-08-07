import { Group } from '@visx/group';
import { Arc } from '@visx/shape';
import { scaleOrdinal } from '@visx/scale';
import { useTheme } from '@emotion/react';
import { Chip, Stack, Tooltip, Typography } from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import { useState } from 'react';

const width = 350;
const height = 350;
const centerX = width / 2;
const centerY = height / 2;
const radius = Math.min(width, height) / 2;

const SentimentAnalysisChart = ({positivePercentage, neutralPercentage, negativePercentage, analyticsData}) => {
    const theme = useTheme();
  
    const data = [
    { label: "Negative", value: negativePercentage },
    { label: "Neutral", value: neutralPercentage },
    { label: "Positive", value: positivePercentage },
    
]

    const colorScale = scaleOrdinal({
        domain: data.map(d => d.label),
        range: [theme.palette.error.light, theme.palette.info.light, theme.palette.success.light],
      });

    const [hoveredArc, setHoveredArc] = useState(null);

  return (
  <Stack alignItems="center">

    {/* Donut Chart */}
    <svg width={width} height={height}>
      <Group top={centerY} left={centerX}>
        {data.map((d, i) => {
          return (
            <>
            <Arc
              key={`donut-arc-${i}`}
              data={d}
              innerRadius={radius * 0.6}
              outerRadius={radius * 0.9}
              startAngle={i === 0 ? 0 : data.slice(0, i).reduce((acc, cur) => acc + (2 * Math.PI * cur.value) / data.reduce((a, c) => a + c.value, 0), 0)}
              endAngle={i === data.length - 1 ? 2 * Math.PI : data.slice(0, i + 1).reduce((acc, cur) => acc + (2 * Math.PI * cur.value) / data.reduce((a, c) => a + c.value, 0), 0)}
              fill={colorScale(d.label)}
              style={{cursor: 'pointer'}}
              onMouseEnter={() => setHoveredArc(d.label)}
              onMouseLeave={() => setHoveredArc(null)}
            />
            </>
          );
        })}
      </Group>
    </svg>

    { /* Legend Chips for Donut Chart */}
    <Stack direction="row" justifyContent="center" mt="1rem" mb="1rem">
      <Tooltip title={`${positivePercentage}% Positive`}>
        <Chip icon={<SentimentSatisfiedAltIcon />} label={`${positivePercentage}% Positive`} color='success' sx={{ cursor: hoveredArc === 'Positive' ? 'pointer' : 'auto', transform: hoveredArc === 'Positive' ? 'scale(1.15)' : 'scale(1)', transition: "0.2s" }}/>
      </Tooltip>
      <Tooltip title={`${neutralPercentage}% Neutral`}>
        <Chip icon={<SentimentNeutralIcon />} label={`${neutralPercentage}% Neutral`} color='info'  sx={{ mr: "0.8rem", ml: "0.8rem", cursor: hoveredArc === 'Neutral' ? 'pointer' : 'auto', transform: hoveredArc === 'Neutral' ? 'scale(1.15)' : 'scale(1)', transition: "0.2s" }} />
      </Tooltip>
      <Tooltip title={`Negative: ${negativePercentage}%`}>
        <Chip icon={<SentimentVeryDissatisfiedIcon/>} label={`Negative: ${negativePercentage}%`} color='error' sx={{ cursor: hoveredArc === 'Negative' ? 'pointer' : 'auto', transform: hoveredArc === 'Negative' ? 'scale(1.15)' : 'scale(1)', transition: "0.2s"}}/>
      </Tooltip>
    </Stack>
    <Typography color="text.secondary">
        {`*Based on analysis of ${analyticsData.messageCount} messages from this chat-room`}
    </Typography>
  </Stack>
  );
};

export default SentimentAnalysisChart;
