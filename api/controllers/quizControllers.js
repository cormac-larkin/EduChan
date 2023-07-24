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
    const duplicateQuizQuery = "SELECT * FROM quiz WHERE title = $1 and member_id = $2";
    const duplicateQuizResult = await pool.query(duplicateQuizQuery, [quizName, userID]);
    if (duplicateQuizResult.rowCount) {
        return res.status(409).json({error: `You already have a quiz named '${quizName}'. Pleasse choose a different name`})
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
    return res
      .status(200)
      .json({
        message: "Quiz created successfully",
        quizID: result.rows[0].quiz_id,
      });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export { createQuiz };
