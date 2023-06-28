import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./registrationForm.module.css";

function LoginForm() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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
      const response = await axios.post("http://localhost:5000/auth/login", formData, {
        withCredentials: true
      });

    if(response.status === 200 && response.data.isTeacher) {
      navigate("/dashboard/teacher")
    } else if(response.status === 200 && !response.data.isTeacher) {
      navigate("/dashboard/student")
    }
      
      
    } catch (error) {
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
    </form>
  );
}

export default LoginForm;
