import { useState } from "react";
import { Typography, Box, Button } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";

function ApprovalList({ pendingApprovals, approved, onChange, onSubmit }) {


  return (
    <Box component="form"
    onSubmit={onSubmit}
    >
      <Typography
        component="h1"
        variant="h4"
        align="center"
        paddingBottom="1rem"
      >
        {`${pendingApprovals.length} Pending ${pendingApprovals.length === 1 ? 'Approval' : "Approvals"}`}
      </Typography>

      <List
        dense
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
      >
        {pendingApprovals.map((pending, index) => {
          const labelId = `checkbox-list-secondary-label-${index}`;
          return (
            <ListItem
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
                <ListItemText id={labelId} primary={`${pending.email}`} />
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
