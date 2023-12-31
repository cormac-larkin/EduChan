import pool from "../database/config.js";
import { hash, compare } from "bcrypt";
import isNumber from "../utils/isNumber.js";

const registerTeacher = async (req, res) => {
  try {
    const { firstName, lastName, email, password, passwordConfirmation } =
      req.body;

    // Ensure all required properties are present in the request body
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !passwordConfirmation
    ) {
      return res
        .status(400)
        .json({ error: "Request body is missing required properties" });
    }

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
      "INSERT INTO member (first_name, last_name, is_teacher, email, password_hash, join_date, last_login, is_approved) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *";
    const userData = [
      firstName,
      lastName,
      true, // Mark User as a Teacher
      email,
      hashedPassword,
      new Date(),
      new Date(),
      false, // Teacher Accounts require approval from an Admin before they can be used
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

    // Ensure all required properties are present in the request body
    if (
      !firstName ||
      !lastName ||
      !email ||
      !studentNumber ||
      !password ||
      !passwordConfirmation
    ) {
      return res
        .status(400)
        .json({ error: "Request body is missing required properties" });
    }

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
      "INSERT INTO member (first_name, last_name, is_teacher, is_admin, email, student_number, password_hash, join_date, last_login, is_approved) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";
    const userData = [
      firstName,
      lastName,
      false, // Mark as non Teacher (Student)
      false, // Mark user as a non-Admin 
      email,
      studentNumber,
      hashedPassword,
      new Date(),
      new Date(),
      true, // Student User Accounts are approved by default
    ];

    await pool.query(insertNewUser, userData);

    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

// Authorization for this route is checked by middleware (see 'userRoutes.js)
const getAllUsers = async (req, res) => {
  try {
    const getAllUsersQuery = "SELECT * FROM member";
    const result = await pool.query(getAllUsersQuery);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const getUser = async (req, res) => {
  try {
    // Get userID from URL parameters
    const userID = req.params.userID;

    // Verify that the userID contains only digits
    if (!isNumber(userID)) {
      return res.sendStatus(400);
    }

    // If User doesn't exist, return 404
    const findUserQuery =
      "SELECT member_id, first_name, last_name, email, is_admin, join_date, last_login, student_number FROM member WHERE member_id = $1";
    const result = await pool.query(findUserQuery, [userID]);
    if (!result.rowCount) {
      return res.sendStatus(404);
    }

    // Otherwise return their data (excluding the password hash)
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const getOwnedChats = async (req, res) => {
  try {
    // Get userID from URL parameters
    const userID = req.params.userID;

    // Verify that the userID contains only digits
    if (!isNumber(userID)) {
      return res.status(400).json({error: "The user ID must contain only numeric characters (0-9)"});
    }

    // Verify that the client has permission to retrieve this data (users can only retrieve their own chats)
    if (userID != req.session.user.id) {
      return res.status(403).json({error: "You do not have permission to access this resource"});
    }

    // Find and return any chats owned by the user (put all archived/hidden chats at the end of the result set)
    const findOwnedChats =
      "SELECT * FROM room WHERE member_id = $1 ORDER BY creation_date DESC, hidden ASC";
    const result = await pool.query(findOwnedChats, [userID]);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const getJoinedChats = async (req, res) => {
  try {
    const userID = req.params.userID;

    // Validate that the roomID parameter contains only digits
    if (!isNumber(userID)) {
      return res.sendStatus(400);
    }

    // Verify userID exists
    const verifyUserQuery = "SELECT * FROM member WHERE member_id = $1";
    const verifyUserResult = await pool.query(verifyUserQuery, [userID]);

    // Return 404 if no user with the ID exists
    if (!verifyUserResult.rowCount) {
      return res
        .status(404)
        .json({ error: `User with ID '${userID}' not found` });
    }

    const getJoinedChatsQuery = `SELECT DISTINCT room.room_id, room.title, room.description, room.image_url, room.creation_date, room.hidden, room.member_id FROM room INNER JOIN room_member ON room.room_id = room_member.room_id WHERE room_member.member_id = $1`;
    const getJoinedChatsResult = await pool.query(getJoinedChatsQuery, [
      userID,
    ]);

    return res.status(200).json(getJoinedChatsResult.rows);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const approveUsers = async (req, res) => {
  try {
    const { approvedEmails } = req.body; // An array of email addresses to approve

    // Verify that the request includes the array of approvals
    if (!approvedEmails || approvedEmails.length === 0) {
      return res.sendStatus(400);
    }

    for (const approvedEmail of approvedEmails) {
      // Verify that the User exists
      const findUserQuery = "SELECT * FROM member WHERE email = $1";
      const findUserResult = await pool.query(findUserQuery, [approvedEmail]);
      if (!findUserResult.rowCount) {
        continue;
      }

      // Mark the User as approved
      const approveUserQuery =
        "UPDATE member SET is_approved = true WHERE email = $1";
      await pool.query(approveUserQuery, [approvedEmail]);
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const getQuizAttempt = async (req, res) => {
  try {
    const userID = req.params.userID;
    const quizID = req.params.quizID;

    // Validate that the roomID parameter contains only digits
    if (!isNumber(userID) || !isNumber(quizID)) {
      return res.sendStatus(400);
    }

    // Verify userID exists
    const verifyUserQuery = "SELECT * FROM member WHERE member_id = $1";
    const verifyUserResult = await pool.query(verifyUserQuery, [userID]);

    // Return 404 if no user with the ID exists
    if (!verifyUserResult.rowCount) {
      return res
        .status(404)
        .json({ error: `User with ID '${userID}' not found` });
    }

    // Get the users attempt for this quiz
    const getQuizAttemptsQuery = `WITH question_answers AS (
      SELECT
        a.attempt_id,
        q.quiz_id,
        q.title AS quiz_title,
        qn.question_id,
        qn.content AS question_content,
        ans.answer_id,
        ans.content AS answer_content,
        ans.is_correct,
        aa.was_selected
      FROM
        member m
      JOIN
        quiz q ON m.member_id = q.member_id
      JOIN
        attempt a ON q.quiz_id = a.quiz_id
      JOIN
        attempt_answer aa ON a.attempt_id = aa.attempt_id
      JOIN
        question qn ON aa.question_id = qn.question_id
      LEFT JOIN
        answer ans ON aa.answer_id = ans.answer_id
      WHERE
        a.member_id = $1
        AND a.quiz_id = $2
    ),
    grouped_question_answers AS (
      SELECT
        attempt_id,
        quiz_id,
        quiz_title,
        question_id,
        question_content,
        json_agg(
          json_build_object(
            'answer_id', answer_id,
            'content', answer_content,
            'is_correct', is_correct,
            'was_selected', was_selected
          )
        ) AS answers
      FROM
        question_answers
      GROUP BY
        attempt_id, quiz_id, quiz_title, question_id, question_content
    )
    SELECT
      json_build_object(
        'attempt_id', attempt_id,
        'quiz_id', quiz_id,
        'quiz_title', quiz_title,
        'questions', json_agg(
          json_build_object(
            'question_id', question_id,
            'content', question_content,
            'answers', answers
          ) ORDER BY question_id -- Order the questions by question_id
        )
      ) AS quiz_attempt
    FROM
      grouped_question_answers
    GROUP BY
      attempt_id, quiz_id, quiz_title
    ORDER BY
      attempt_id DESC`;

    const getQuizAttemptsResult = await pool.query(getQuizAttemptsQuery, [
      userID, quizID
    ]);

    return res.status(200).json(getQuizAttemptsResult.rows[0]);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const getOwnedQuizzes = async (req, res) => {
  try {
    const userID = req.params.userID;

    // Validate that the roomID parameter contains only digits
    if (!isNumber(userID)) {
      return res.sendStatus(400);
    }

    // Verify userID exists
    const verifyUserQuery = "SELECT * FROM member WHERE member_id = $1";
    const verifyUserResult = await pool.query(verifyUserQuery, [userID]);

    // Return 404 if no user with the ID exists
    if (!verifyUserResult.rowCount) {
      return res
        .status(404)
        .json({ error: `User with ID '${userID}' not found` });
    }

    // Get the users owned quizzes
    const getOwnedQuizzesQuery = "SELECT * FROM quiz WHERE member_id = $1";
    const ownedQuizzes = await pool.query(getOwnedQuizzesQuery, [userID]);

    return res.status(200).json(ownedQuizzes.rows);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export {
  registerStudent,
  registerTeacher,
  getAllUsers,
  getUser,
  getOwnedChats,
  getJoinedChats,
  approveUsers,
  getQuizAttempt,
  getOwnedQuizzes,
};
