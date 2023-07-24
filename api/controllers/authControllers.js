import pool from "../database/config.js";
import { hash, compare } from "bcrypt";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if a user with the supplied credentials exists
    const findUser = "SELECT * FROM member WHERE email = $1";
    const result = await pool.query(findUser, [email]);

    // Return 401 status if no user exists with the email
    if (!result.rowCount) {
      return res
        .status(401)
        .json({ error: "Login Failed: Invalid Credentials" });
    }

    // Check if the Users account is approved (Teacher accounts must be approved  by an Admin before login is available)
    if(!result.rows[0].is_approved) {
      return res.status(401).json({error: "Login failed. Please contact your school administrator to request approval for this account"});
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
    const updateLastLogin =
      "UPDATE member SET last_login = $1 WHERE email = $2";
    await pool.query(updateLastLogin, [new Date(), email]);

    // Attach the User's data to the session
    req.session.user = {
      id: result.rows[0].member_id,
      email: email,
      isTeacher: result.rows[0].is_teacher,
      isAdmin: result.rows[0].is_admin
    };

    return res.status(200).json(req.session.user);
  } catch (error) {
    console.error(error);
    return res.status(500);
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy();
    return res.status(200).json({ message: "Logout successful!" });
  } catch (error) {
    console.error(error);
    return res.status(500);
  }
};

// The React AuthProvider makes a request to this endpoint when the React App is loaded. If a valid session cookie is included with the request,
// We know that the user is authenticated. We send a 200 response and the User Object as the response body. This user object is stored in the react App
// And used to determine the role of the User and which part of the App they should see (Teacher or Student)
const checkAuth = async (req, res) => {
  if (req.session.user) {
    // If 'user' object is attached to the session, we know the client is authenticated (user object attached to session upon successful login)
    return res.status(200).json(req.session.user);
  } else {
    return res.sendStatus(401);
  }
};

export { login, logout, checkAuth };
