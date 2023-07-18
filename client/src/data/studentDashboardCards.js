import chatBubbleIcon from "../assets/chatBubble.svg";
import analyticsIcon from "../assets/analytics.svg";
import settingsIcon from "../assets/settings.svg";
import logoutIcon from "../assets/logout.svg";

const studentDashboardCards = [
  {
    title: "Browse Chats",
    description: "View your chats",
    imageURI: chatBubbleIcon,
    href: "/chats/"
  },
  {
    title: "Analytics",
    description: "View your quiz results and participation data",
    imageURI: analyticsIcon,
    href: "#"
  },
  {
    title: "My Account",
    description: "Manage your account",
    imageURI: settingsIcon,
    href: "#"
  },
  {
    title: "Logout",
    description: "Log out of your account",
    imageURI: logoutIcon,
    href: "#"
  },
];

export default studentDashboardCards;
