import {
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";

function SideBar({ collapseSideBar }) {
  return (
    <Box
      sx={{
        width: collapseSideBar ? "0%" : "20%",
        transition: "width 0.4s ease",
        borderRight: collapseSideBar ? "none" : "1px solid grey",
        overflow: "hidden",
        marginRight: collapseSideBar ? "0" : "0.5rem"
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {["Placeholder", "Placeholder", "Placeholder", "Placeholder"].map((text, index) => (
          <ListItem key={index} disablePadding>
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
        {["Placeholder", "Placeholder", "Placeholder"].map((text, index) => (
          <ListItem key={index} disablePadding>
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
