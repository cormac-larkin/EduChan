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
    const getQuizQuery = `SELECT
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

const addQuestion = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const quizID = req.params.quizID;

    const { questionText, answers } = req.body;

    // Verify that the quizID is a number
    if (!isNumber(quizID)) {
      return res.sendStatus(400);
    }

    // Verify body properties are present
    if (!questionText || !answers) {
      return res.sendStatus(400);
    }

    // Verify that the client has permission to add questions to the quiz (must own the quiz)
    const findQuizQuery =
      "SELECT * FROM quiz WHERE quiz_id = $1 AND member_id = $2";
    const findQuizResult = await pool.query(findQuizQuery, [quizID, userID]);
    if (!findQuizResult.rowCount) {
      return res.sendStatus(403);
    }

    // Insert the question
    const insertQuestionQuery =
      "INSERT INTO question (content, quiz_id) VALUES ($1, $2) RETURNING *";
    const insertQuestionResult = await pool.query(insertQuestionQuery, [
      questionText,
      quizID,
    ]);

    // Get the newly inserted question_id so we can insert the answers and link them with foreign key
    const newQuestionID = insertQuestionResult.rows[0].question_id;

    // Insert the answers and link to question
    for (const answer of answers) {
      const insertAnswerQuery =
        "INSERT INTO answer (content, is_correct, question_id) VALUES ($1, $2, $3)";
      await pool.query(insertAnswerQuery, [
        answer.answerText,
        answer.isCorrect,
        newQuestionID,
      ]);
    }

    return res.status(200).json({ message: "Question added successfully" });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const addAttempt = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const quizID = req.params.quizID;

    const { quizAttempt } = req.body; // Array of objects containing a question_id and an array of selected answers for the question

    // Verify that the quizID is a number
    if (!isNumber(quizID)) {
      return res.sendStatus(400);
    }

    // Verify the request body contains the required property
    if (!quizAttempt || quizAttempt.length === 0) {
      return res.sendStatus(400);
    }

    // Verify that the quizID exists
    const findQuizQuery = "SELECT * FROM quiz WHERE quiz_id = $1";
    const findQuizResult = await pool.query(findQuizQuery, [quizID]);
    if (!findQuizResult.rowCount) {
      return res
        .status(404)
        .json({ error: `Quiz with ID '${quizID}' not found` });
    }

    // Insert the new attempt and get it's ID
    const createAttemptQuery =
      "INSERT INTO attempt (timestamp, member_id, quiz_id) VALUES ($1, $2, $3) RETURNING *";
    const createAttemptResult = await pool.query(createAttemptQuery, [
      new Date(),
      userID,
      quizID,
    ]);
    const newAttemptID = createAttemptResult.rows[0].attempt_id;

    // Insert all the user's answers from each question attempt in the quiz attempt
    for (const questionAttempt of quizAttempt) {
      const { id: questionID, answers } = questionAttempt;
      for (const answer of answers) {
        const insertQuestionAttempt =
          "INSERT INTO attempt_answer (attempt_id, question_id, answer_id, was_selected) VALUES ($1, $2, $3, $4)";
        await pool.query(insertQuestionAttempt, [newAttemptID, questionID, answer.answer_id, answer.isChosen]);
      }
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export { createQuiz, getQuiz, addQuestion, addAttempt };
