import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Error403Page from "../pages/error/Error403Page";

const ProtectedRoute = ({ children, permissionLevel }) => {
  const { user } = useAuth();

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // (Permission Levels: Admin > Teacher > Student)
  // Display 403 Forbidden error page if user is below the required Permission level
  if ((permissionLevel === "Teacher" && !user.isTeacher) || (permissionLevel === "Admin" && !user.isAdmin)) {
    return <Error403Page/>
  }

  return children;
};

export default ProtectedRoute;
