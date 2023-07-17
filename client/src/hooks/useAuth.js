import { useContext } from "react";
import { AuthContext } from "../components/authentication/AuthProvider";

/**
 * Retrieves the authentication context to determine whether the client is currently authenticated.
 *
 * Throws an Error if this hook is called from a component which is not wrapped in the AuthProvider, because there is no access to the AuthContext.
 * @returns {Object} -
 */
const useAuth = () => {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error(
      "useAuth can only be used within a component which is wrapped in the AuthProvider"
    );
  }
  return auth;
};

export default useAuth;