import pool from "../database/config.js";
import { hash, compare } from "bcrypt";

const registerTeacher = async (req, res) => {
  try {
    const { firstName, lastName, email, password, passwordConfirmation } =
      req.body;

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
      return res.status(409).json({
        error:
          "Registration Failed. An account with that email address already exists",
      });
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
    return res.sendStatus(500);
  }
};

const registerStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      studentNumber,
      password,
      passwordConfirmation,
    } = req.body;

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
      return res.status(409).json({
        error:
          "Registration Failed. An account with that email address already exists",
      });
    }

    const hashedPassword = await hash(password, 10); // Hash the plaintext password before inserting into DB

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
    return res.sendStatus(500);
  }
};

const getUser = async (req, res) => {
  try {
    // Get userID from URL parameters
    const userID = req.params.userID;

    // If User doesn't exist, return 404
    const findUserQuery =
      "SELECT member_id, first_name, last_name, email, is_admin, join_date, last_login, student_number FROM member WHERE member_id = $1";
    const result = await pool.query(findUserQuery, [userID]);
    if (!result.rowCount) {
      return res.sendStatus(404);
    }

    // Otherwise return their data (excluding the password hash)
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const getOwnedChats = async (req, res) => {
  try {
    // Get userID from URL parameters
    const userID = req.params.userID;

    // Verify that the client has permission to retrieve this data (users can only retrieve their own chats)
    if (userID != req.session.user.id) {
        return res.sendStatus(401);
    }

    // Find and return any chats owned by the user
    const findOwnedChats = "SELECT * FROM room WHERE member_id = $1";
    const result = await pool.query(findOwnedChats, [userID]);

    return res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export { registerStudent, registerTeacher, getUser, getOwnedChats };
