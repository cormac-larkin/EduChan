import chatBubbleIcon from "../assets/chatBubble.svg";
import newChatIcon from "../assets/newChat.svg";
import analyticsIcon from "../assets/analytics.svg";
import quizIcon from "../assets/quiz.svg";
import settingsIcon from "../assets/settings.svg";
import logoutIcon from "../assets/logout.svg";
import approvalIcon from "../assets/id-card.svg"

const adminDashboardCards = [
  {
    title: "Approve Accounts",
    description: "View and respond to account approval requests",
    imageURI: approvalIcon,
    href: "/approvals/",
  },
  {
    title: "Browse Chats",
    description: "View and manage your chats",
    imageURI: chatBubbleIcon,
    href: "/chats/",
  },
  {
    title: "Create Chat",
    description: "Create a new chatroom",
    imageURI: newChatIcon,
    href: "/chats/create",
  },
  {
    title: "Analytics",
    description: "View word clouds, sentiment analysis and more",
    imageURI: analyticsIcon,
    href: "#",
  },
  {
    title: "Create Quizzes",
    description: "Create new quizzes to test your Students",
    imageURI: quizIcon,
    href: "/quizzes/create",
  },
  {
    title: "My Account",
    description: "Manage your account",
    imageURI: settingsIcon,
    href: "#",
  },
  {
    title: "Logout",
    description: "Log out of your account",
    imageURI: logoutIcon,
    href: "#",
  },
];

export default adminDashboardCards;
