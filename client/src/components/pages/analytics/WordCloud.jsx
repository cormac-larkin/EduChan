import { useState } from "react";
import { Box, Stack, Divider, Typography, Select, MenuItem, Checkbox } from "@mui/material";
import { Text } from "@visx/text";
import { scaleLog } from "@visx/scale";
import Wordcloud from "@visx/wordcloud/lib/Wordcloud";
import stopWords from "../../../data/stopWords";
import { useTheme } from "@emotion/react";


const lightModeColors = ["#143059", "#2F6B9A", "#82a6c2"];
const darkModeColors = ["#228c01", "#3bc910", "#76ff4d"];

function wordFreq(text) {
  const words = text
    .replace(/[.,;:!?-]/g, "")
    .split(/\s/)
    .filter((word) => !stopWords.includes(word.toLowerCase()));
  const freqMap = {};

  for (const w of words) {
    if (!freqMap[w]) freqMap[w] = 0;
    freqMap[w] += 1;
  }
  return Object.keys(freqMap).map((word) => ({
    text: word,
    value: freqMap[word],
  }));
}

function getRotationDegree() {
  const rand = Math.random();
  const degree = rand > 0.5 ? 60 : -60;
  return rand * degree;
}

const fixedValueGenerator = () => 0.5;

const WordCloud = ({ inputWords, width, height, showControls }) => {

  const theme = useTheme();

  const [spiralType, setSpiralType] = useState("archimedean");
  const [withRotation, setWithRotation] = useState(false);

  const words = wordFreq(inputWords);

  const fontScale = scaleLog({
    domain: [
      Math.min(...words.map((w) => w.value)),
      Math.max(...words.map((w) => w.value)),
    ],
    range: [10, 100],
  });

  const fontSizeSetter = (datum) => fontScale(datum.value);

  return (
    <Box className="wordcloudContainer">
      
      <Wordcloud
        words={words}
        width={width}
        height={height}
        fontSize={fontSizeSetter}
        font={"Impact"}
        padding={2}
        spiral={spiralType}
        rotate={withRotation ? getRotationDegree : 0}
        random={fixedValueGenerator}
      >
        {(cloudWords) =>
          cloudWords.map((w, i) => (
            <Text
              key={w.text}
              fill={theme.palette.mode === "light" ? lightModeColors[i % lightModeColors.length] : darkModeColors[i % darkModeColors.length]}
              textAnchor={"middle"}
              transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
              fontSize={w.size}
              fontFamily={w.font}
            >
              {w.text}
            </Text>
          ))
        }
      </Wordcloud>
      {showControls && (
        <Stack width="100%" pl="1rem">
          <label>
            Rotate &nbsp;
            <Checkbox
              checked={withRotation}
              onChange={() => setWithRotation(!withRotation)}
            />
          </label>
          <label>
            Pattern &nbsp;
            <Select
              onChange={(e) => setSpiralType(e.target.value)}
              value={spiralType}
              size="small"
            >
              <MenuItem key={"archimedean"} value={"archimedean"}>
                Archimedean
              </MenuItem>
              <MenuItem key={"rectangular"} value={"rectangular"}>
                Rectangular
              </MenuItem>
            </Select>
          </label>
        </Stack>
      )}
      <style>{`
        .wordcloudContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          user-select: none;
          border-radius: 5px;
          margin-top: 0.5rem;
        }
        .wordcloud svg {
          margin: 1rem 0;
          cursor: pointer;
        }

        .wordcloud label {
          display: inline-flex;
          align-items: center;
          font-size: 14px;
          margin-right: 8px;
        }
        .wordcloud textarea {
          min-height: 100px;
        }
      `}</style>
    </Box>
  );
};

export default WordCloud;
