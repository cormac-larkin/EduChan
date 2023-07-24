import pool from "../database/config.js";
import isNumber from "../utils/isNumber.js";
import "dotenv/config";

const createQuiz = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { quizName, description } = req.body;

    // Verify the required properties are present
    if (!quizName) {
      return res
        .status(400)
        .json({ error: "Request body missing required property 'quizName'" });
    }

    // Verify that this user does not already have a quiz with the same name
    const duplicateQuizQuery =
      "SELECT * FROM quiz WHERE title = $1 and member_id = $2";
    const duplicateQuizResult = await pool.query(duplicateQuizQuery, [
      quizName,
      userID,
    ]);
    if (duplicateQuizResult.rowCount) {
      return res.status(409).json({
        error: `You already have a quiz named '${quizName}'. Pleasse choose a different name`,
      });
    }

    // Insert the new quiz
    const createQuizQuery =
      "INSERT INTO quiz (title, description, member_id) VALUES ($1, $2, $3) RETURNING *";
    const result = await pool.query(createQuizQuery, [
      quizName,
      description,
      userID,
    ]);

    // Return the quiz_id of the new quiz
    return res.status(200).json({
      message: "Quiz created successfully",
      quizID: result.rows[0].quiz_id,
    });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const getQuiz = async (req, res) => {
  try {
    const quizID = req.params.quizID;

    // Verify that the quizID contains only digits
    if (!isNumber(quizID)) {
      return res.sendStatus(400);
    }

    // Verify that the quiz exists
    const getQuizQuery = 
    `SELECT
    quiz.*,
    json_agg(
        json_build_object(
            'question_id', question.question_id,
            'content', question.content,
            'answers', (
            SELECT json_agg(answer.*)
            FROM answer
            WHERE question.question_id = answer.question_id
        ))
    ) as questions
    FROM
    quiz
    LEFT JOIN
    question
    ON
    quiz.quiz_id = question.quiz_id
    WHERE
    quiz.quiz_id = $1
    GROUP BY
    quiz.quiz_id;
  `;
    const result = await pool.query(getQuizQuery, [quizID]);
    if (!result.rowCount) {
      return res.status(404).json({ error: `No quiz with ID ${quizID} found` });
    }

    // Return the quiz data
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export { createQuiz, getQuiz };
