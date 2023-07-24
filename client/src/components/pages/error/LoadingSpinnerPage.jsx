import { Stack } from "@mui/material";
import { ThreeCircles } from "react-loader-spinner";

function LoadingSpinnerPage() {
  return (
    <Stack justifyContent="center" alignItems="center" height="60vh">
      <ThreeCircles />
    </Stack>
  );
}

export default LoadingSpinnerPage;
