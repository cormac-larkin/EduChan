import { Toolbar, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box } from "@mui/material";
import MailIcon from '@mui/icons-material/Mail';

function SideBar({collapseSideBar}) {

  return (
    <Box sx={{width: collapseSideBar ? "0%" : "20%", transition: "width 0.4s ease", borderRight: collapseSideBar ? "none" : "1px solid grey", overflow: "hidden"}}>
      <Toolbar />
      <Divider />
      <List>
        {["Inbox", "Starred", "Send email", "Drafts"].map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                 <MailIcon />
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {["All mail", "Trash", "Spam"].map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default SideBar;
