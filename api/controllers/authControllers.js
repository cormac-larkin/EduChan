import pool from "../database/config.js";
import { hash } from "bcrypt";

const registerTeacher = async (req, res) => {
  try {

    const { firstName, lastName, email, password, passwordConfirmation } = req.body;

    // Check that password & password confirmation fields match (also performed at client side)
    if (password !== passwordConfirmation) {
      return res
        .status(400)
        .json({ error: "Password and password confirmation do not match" });
    }

    // Check that another user with this email is not already registered
    const queryExistingUsers = "SELECT * FROM member WHERE email = $1";
    const existingUsers = await pool.query(queryExistingUsers, [email]);

    if (existingUsers.rowCount) {
      return res
        .status(409)
        .json({ error: "Registration Failed. An account with that email address already exists" });
    }

    const hashedPassword = await hash(password, 10); //Hash the plaintext password before inserting into DB

    const insertNewUser =
      "INSERT INTO member (first_name, last_name, is_admin, email, password_hash, join_date, last_login) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";
    const userData = [
      firstName,
      lastName,
      true, // Teacher Users are admins
      email,
      hashedPassword,
      new Date(),
      new Date(),
    ];

    await pool.query(insertNewUser, userData);

    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500);
  }
};

const registerStudent = async (req, res) => {
  try {

    const { firstName, lastName, email, studentNumber, password, passwordConfirmation } = req.body;

    // Check that password & password confirmation fields match (also performed at client side)
    if (password !== passwordConfirmation) {
      return res
        .status(400)
        .json({ error: "Password and password confirmation do not match" });
    }

    // Check that another user with this email is not already registered
    const queryExistingUsers = "SELECT * FROM member WHERE email = $1";
    const existingUsers = await pool.query(queryExistingUsers, [email]);

    if (existingUsers.rowCount) {
      return res
        .status(409)
        .json({ error: "Registration Failed. An account with that email address already exists" });
    }

    const hashedPassword = await hash(password, 10); //Hash the plaintext password before inserting into DB

    const insertNewUser =
      "INSERT INTO member (first_name, last_name, is_admin, email, student_number, password_hash, join_date, last_login) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
    const userData = [
      firstName,
      lastName,
      false, // Student Users are not admins
      email,
      studentNumber,
      hashedPassword,
      new Date(),
      new Date(),
    ];

    await pool.query(insertNewUser, userData);

    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500);
  }
};

export {registerTeacher, registerStudent};
