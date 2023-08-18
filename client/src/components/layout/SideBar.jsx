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
import DashboardIcon from "@mui/icons-material/Dashboard";
import ChatIcon from "@mui/icons-material/Chat";
import AddCommentIcon from "@mui/icons-material/AddComment";
import QuizIcon from "@mui/icons-material/Quiz";
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import { useContext } from "react";
import { AuthContext } from "../authentication/AuthProvider";
import { Link } from "react-router-dom";

function SideBar({ collapseSideBar }) {
  const { user } = useContext(AuthContext);

  const teacherSideBarItems = [
    { text: "Dashboard", icon: <DashboardIcon />, href: "/dashboard" },
    { text: "Browse Chats", icon: <ChatIcon />, href: "/chats" },
    { text: "Create Chat", icon: <AddCommentIcon />, href: "/chats/create" },
    { text: "My Quizzes", icon: <QuizIcon />, href: "/quizzes/" },
    { text: "Create Quiz", icon: <AddToPhotosIcon />, href: "/quizzes/create" },
    { text: "Analytics", icon: <AutoGraphIcon />, href: "/analytics" },
  ];

  const studentSideBarItems = [
    { text: "Dashboard", icon: DashboardIcon },
    { text: "Browse Chats", icon: ChatIcon },
    { text: "Analytics", icon: AutoGraphIcon },
  ];

  const sideBarItems = user.isTeacher ? teacherSideBarItems : studentSideBarItems;

  return (
    <Box
      sx={{
        width: collapseSideBar ? "0%" : "20%",
        transition: "width 0.4s ease",
        borderRight: collapseSideBar ? "none" : "1px solid grey",
        overflow: "hidden",
        marginRight: collapseSideBar ? "0" : "0.5rem",
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {sideBarItems.map((item, index) => (
          <Link key={index} style={{ textDecoration: "none"}} to={item.href}>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
          </Link>
        ))}
      </List>
      <Divider />
      <List>
        {["My Account", "Settings", "Log Out"].map((text, index) => (
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
        {["Help", "Contact Us"].map((text, index) => (
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
