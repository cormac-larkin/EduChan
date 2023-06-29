import { createContext, useEffect, useState } from 'react';
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();

  useEffect(() => {

    const checkAuth = async () => {

      try {
        const response = await axios.get("http://localhost:5000/auth", { // Make an API call to check if there is an active session for this client
        withCredentials: true
      });

      
        setUser(response.data);
        console.log(`Logged in as: ${response.data.email}`);
      
      } catch (error) {
        console.error("No active session found. Please log in.")
      }
    }
  
      checkAuth();
    
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
