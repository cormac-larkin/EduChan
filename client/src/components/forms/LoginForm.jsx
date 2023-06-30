import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./form.module.css";
import { AuthContext } from "../context/AuthProvider";

function LoginForm() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Updates the formData object when the form inputs are modified
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent page reload

    try {
      const response = await axios.post(
        "http://localhost:5000/auth/login",
        formData,
        {
          withCredentials: true,
        }
      );

      setUser(response.data); // Use the API response to set the global Auth Context (So we know which user is logged in and their role/permissions)

      if (response.data.isTeacher) {
        navigate("/dashboard/teacher");
      }

      if (!response.data.isTeacher) {
        navigate("/dashboard/student");
      }
    } catch (error) {
      setError(error.response.data.error);
      console.error(error.response.data.error); // Log the error message from the API
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1>Log In</h1>
      <label htmlFor="email">Email</label>
      <input
        type="email"
        name="email"
        id="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => handleInputChange(e)}
      />
      <label htmlFor="lastName">Password</label>
      <input
        type="password"
        name="password"
        id="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => handleInputChange(e)}
      />
      <button type="submit">Log In</button>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </form>
  );
}

export default LoginForm;
