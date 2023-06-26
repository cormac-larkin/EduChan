import { useState } from "react";
import axios from "axios";
import styles from "./registrationForm.module.css";

function TeacherRegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
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

    // Check password and password confirmation inputs match
    if (formData.password !== formData.passwordConfirmation) {
      alert("Passwords must match");
      return;
    }

    try {
      await axios.post("http://localhost:5000/auth/register/teacher", formData);

      // TODO
      // Registration successful, redirect to Teacher Dashboard

    } catch (error) {
      console.error(error.response.data.error); // Log the error message from the API
    }
  };

  return (
    <form className={styles.registrationForm} onSubmit={handleSubmit}>
      <h1>Register as a Teacher</h1>
      <label htmlFor="firstName">First Name</label>
      <input
        type="text"
        name="firstName"
        id="firstName"
        placeholder="First Name"
        value={formData.firstName}
        onChange={(e) => handleInputChange(e)}
      />
      <label htmlFor="lastName">Last Name</label>
      <input
        type="text"
        name="lastName"
        id="lastName"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={(e) => handleInputChange(e)}
      />
      <label htmlFor="email">Email</label>
      <input
        type="email"
        name="email"
        id="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => handleInputChange(e)}
      />
      <label htmlFor="password">Password</label>
      <input
        type="password"
        name="password"
        id="password"
        placeholder="Choose a Password"
        value={formData.password}
        onChange={(e) => handleInputChange(e)}
      />
      <label htmlFor="passwordConfirmation">Confirm Password</label>
      <input
        type="password"
        name="passwordConfirmation"
        id="passwordConfirmation"
        placeholder="Confirm Your Password"
        value={formData.passwordConfirmation}
        onChange={(e) => handleInputChange(e)}
      />
      <button type="submit">Register</button>
    </form>
  );
}

export default TeacherRegistrationForm;
