import { useContext, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import ThemeToggleSwitch from "../UI/ThemeToggleSwitch";
import TerminalIcon from "@mui/icons-material/Terminal";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ChatIcon from "@mui/icons-material/Chat";
import AddCommentIcon from "@mui/icons-material/AddComment";
import QuizIcon from "@mui/icons-material/Quiz";
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import { AuthContext } from "../authentication/AuthProvider";
import { Link, useNavigate } from "react-router-dom";

const teacherMenuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, href: "/dashboard" },
  { text: "Browse Chats", icon: <ChatIcon />, href: "/chats" },
  { text: "Create Chat", icon: <AddCommentIcon />, href: "/chats/create" },
  { text: "My Quizzes", icon: <QuizIcon />, href: "/quizzes/" },
  { text: "Create Quiz", icon: <AddToPhotosIcon />, href: "/quizzes/create" },
  { text: "Analytics", icon: <AutoGraphIcon />, href: "/analytics" },
];

const studentMenuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, href: "/dashboard" },
  { text: "Browse Chats", icon: <ChatIcon />, href: "/chats" },
  { text: "Analytics", icon: <AutoGraphIcon />, href: "#" },
];

const settings = ["Account", "Dashboard", "Logout"];

function NavBar({ onThemeChange }) {
  const { user, logout } = useContext(AuthContext);
  const hamburgerMenuItems = user?.isTeacher
    ? teacherMenuItems
    : studentMenuItems;
  const navigate = useNavigate();

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleCloseUserMenu();
      navigate("/login", {
        state: {
          message: "Logout Successful", // Pass success message to the logout page so we can display notification
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDashboardNavigate = () => {
    handleCloseUserMenu();
    navigate("/dashboard");
  };

  /**
   * Toggle the Dark Theme on/off
   */
  const handleThemeChange = () => {
    onThemeChange((prevThemeState) => !prevThemeState);
  };

  return (
    <AppBar
      position="sticky"
      sx={{ maxWidth: "100%", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      elevation={6}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <TerminalIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 900,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            EduChan
          </Typography>

          {user && (
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TerminalIcon
                  sx={{ display: { xs: "flex", md: "none" }, ml: 1 }}
                />
              </Box>

              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {hamburgerMenuItems.map((obj, index) => (
                  <Link  key={index} to={obj.href} style={{ textDecoration: "none" }}>
                    <MenuItem key={index} onClick={handleCloseNavMenu}>
                      {obj.icon}

                      <Typography
                        textAlign="center"
                        sx={{ paddingLeft: "0.7rem" }}
                      >
                        {obj.text}
                      </Typography>
                    </MenuItem>
                  </Link>
                ))}
              </Menu>
            </Box>
          )}
          {!user && (
            <TerminalIcon sx={{ display: { xs: "flex", md: "none" }, ml: 1 }} />
          )}

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {user &&
              [].map((obj, index) => (
                <Button
                  key={index}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {obj.href}
                </Button>
              ))}
          </Box>

          <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center" }}>
            <ThemeToggleSwitch onChange={handleThemeChange} />
            {user ? (
              <Tooltip title="Account Settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={user?.email}
                    src="https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg"
                  />
                </IconButton>
              </Tooltip>
            ) : (
              <Box sx={{ flexGrow: 1, display: "flex" }}>
                <Button sx={{ my: 2, color: "white", display: "block" }} onClick={() => navigate("/login")}>
                  {"Log In"}
                </Button>
                <Button sx={{ my: 2, color: "white", display: "block" }} onClick={() => navigate("/")}>
                  {"Sign Up"}
                </Button>
              </Box>
            )}
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => {
                    switch (setting) {
                      case "Dashboard":
                        handleDashboardNavigate();
                        break;
                      case "Logout":
                        handleLogout();
                        break;
                      default:
                        handleCloseUserMenu();
                    }
                  }}
                >
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default NavBar;
