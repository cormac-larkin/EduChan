import NavBar from "./NavBar";
import Footer from "./Footer";
import SideBar from "./SideBar";
import { Box, useMediaQuery } from "@mui/material";


function Layout({ children, onThemeChange }) {

  const collapseSideBar = useMediaQuery("(max-width:900px)");

  return (
    <div
      className="layoutWrapper"
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <NavBar onThemeChange={onThemeChange} />
      <Box sx={{ display: "flex", width:"100%" }}>
        <SideBar collapseSideBar={collapseSideBar} />

        <main style={{width: collapseSideBar ? "100%" : "80%", transition: "width 0.4s ease"}}>{children}</main>
      </Box>
      <Footer />
    </div>
  );
}

export default Layout;
