import { Stack, Paper, Divider, Typography } from "@mui/material";
import CreateIcon from '@mui/icons-material/Create';
import paperStyles from "../../styles/paperStyles";
import ChatCreationForm from "../forms/ChatCreationForm";

function ChatCreationPage() {

  return (
    <Stack>
      <Stack p="1rem" direction="row">
        <Stack justifyContent="center">
            <CreateIcon/>
        </Stack>

        <Typography component="h1" variant="h5" align="left" pl="0.5rem">
          <b>{"Create a new Chat Room"}</b>
        </Typography>
      </Stack>
      <Divider />

      <Paper elevation={6} sx={{...paperStyles, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingTop: "0.5rem"}} >
        <ChatCreationForm />
      </Paper>
    </Stack>
  );
}

export default ChatCreationPage;
