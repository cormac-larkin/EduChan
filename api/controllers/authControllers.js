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
      return res
        .status(409)
        .json({
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
    return res.status(500);
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
      return res
        .status(409)
        .json({
          error:
            "Registration Failed. An account with that email address already exists",
        });
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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if a user with the supplied credentials exists
    const findUserQuery = "SELECT * FROM member WHERE email = $1";
    const result = await pool.query(findUserQuery, [email]);

    // Return 401 status if no user exists with the email
    if (!result.rowCount) {
      return res
        .status(401)
        .json({ error: "Login Failed: Invalid Credentials" });
    }

    // If user exists, compare their stored password hash with the password supplied in the login form
    const passwordIsMatch = await compare(
      password,
      result.rows[0].password_hash
    );
    if (!passwordIsMatch) {
      return res
        .status(401)
        .json({ error: "Login Failed: Invalid Credentials" });
    }

    // User is authenticated, update their 'last_login' date to the current date
    const updateLastLoginQuery =
      "UPDATE member SET last_login = $1 WHERE email = $2";
    await pool.query(updateLastLoginQuery, [new Date(), email]);

    // Attach the User's data to the session
    req.session.user = { email: email, isTeacher: result.rows[0].is_admin };

    return res
      .status(200)
      .json(req.session.user);
  } catch (error) {
    console.error(error);
    return res.status(500);
  }
};


// The React AuthProvider makes a request to this endpoint when the React App is loaded. If a valid session cookie is included with the request, 
// We know that the user is authenticated. We send a 200 response and the User Object as the response body. This user object is stored in the react App
// And used to determine the role of the User and which part of the App they should see (Teacher or Student)
const checkAuth = async (req, res) => {

  if (req.session.user) { // If 'user' object is attached to the session, we know the client is authenticated (user object attached to session upon successful login)
    return res.status(200).json(req.session.user);
  } else {
    return res.sendStatus(401);
  }
};

export { registerTeacher, registerStudent, login, checkAuth };
