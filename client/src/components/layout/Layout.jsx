import NavBar from "./NavBar";
import Footer from "./Footer";

function Layout({ children, onThemeChange }) {
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
      <main
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
