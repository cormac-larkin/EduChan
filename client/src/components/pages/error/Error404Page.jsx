import { Stack, Typography } from "@mui/material";

function Error404Page() {
  return (
    <Stack height="100%" width="100%" justifyContent="center" alignItems="center">
      <Typography variant="h1" pb="5rem" align="center">{"404: Page Not Found"}</Typography>

      <Typography variant="h5" align="center">{"Sorry, we couldn't find what you're looking for..."}</Typography>
    </Stack>
  );
}

export default Error404Page;
