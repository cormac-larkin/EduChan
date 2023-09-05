import { createContext, useEffect, useState } from "react";
import { ThreeCircles } from "react-loader-spinner";
import axios from "axios";
import LoadingSpinnerPage from "../pages/error/LoadingSpinnerPage";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Makes an API call to the '/auth' endpoint to determine if the client has a session on the server.
   * If a session is found, the 'user' state is set to an object representing the authenticated User.
   * If no session is found, the 'user' state is set to null.
   */
  const checkAuthStatus = async () => {
    try {
      const response = await axios.get("http://localhost:5000/auth", {
        // Make an API call to check if there is an active session for this client
        withCredentials: true,
      });

      setIsLoading(false);
      setUser(response.data);
      console.log(`Logged in as: ${response.data.email}`);
    } catch (error) {
      setIsLoading(false);
      setUser(null);
      console.error("Please log in.");
    }
  };

  /**
   * POSTS User login credentials to the API login endpoint.
   *
   * @param {String} email - The email address to use for the login attempt
   * @param {String} password - The password to use for the login attempt
   *
   * @throws An Error object containing the error message from the API. Defaults to a generic error message if none is returned from the API.
   */
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/auth/login",
        { email, password },
        {
          withCredentials: true,
        }
      );
      setUser(response.data); // Use the API response to set the global Auth Context (So we know which user is logged in and their role/permissions)
    } catch (error) {
      throw new Error(
        error.response?.data.error || "An error occurred when signing in"
      ); // Re-throw the error so it can be handled by the calling component
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      setUser(null);
    } catch (error) {
      throw new Error(
        error.response?.data.error || "An error occurred when signing out"
      );
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [isLoading]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {isLoading ? <LoadingSpinnerPage /> : children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
