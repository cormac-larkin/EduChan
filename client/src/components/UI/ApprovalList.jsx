import { Typography, Box, Button, ListItemIcon } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import GppMaybeIcon from '@mui/icons-material/GppMaybe';

function ApprovalList({ pendingApprovals, approved, onChange, onSubmit }) {
  return (
    <Box
      component="form"
      display="flex"
      flexDirection="column"
      alignItems="center"
      onSubmit={onSubmit}
    >
      <Typography
        component="h1"
        variant="h4"
        align="center"
        paddingBottom="1rem"
      >
        {`${pendingApprovals.length} ${
          pendingApprovals.length === 1 ? "Account" : "Accounts"
        } Pending Approval`}
      </Typography>

      <List dense sx={{ width: "100%", maxWidth: 360, bgcolor: "inherit" }}>
        {pendingApprovals.map((pending, index) => {
          const labelId = `checkbox-list-secondary-label-${index}`;
          return (
            <ListItem
              sx={{
                border: "1px solid grey",
                borderRadius: "5px",
                marginBottom: "0.2rem",
              }}
              key={index}
              secondaryAction={
                <Checkbox
                  edge="end"
                  onChange={() => onChange(pending.email)}
                  checked={approved.includes(pending.email)}
                  inputProps={{ "aria-labelledby": labelId }}
                />
              }
              disablePadding
            >
              <ListItemButton>
                <ListItemIcon>
                <GppMaybeIcon/>
                </ListItemIcon>
                <ListItemText
                  id={labelId}
                  primary={`${pending.email}`}
                  secondary={`${pending.first_name} ${pending.last_name}`}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Button
        disabled={pendingApprovals.length === 0}
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Submit Approvals
      </Button>
    </Box>
  );
}

export default ApprovalList;
