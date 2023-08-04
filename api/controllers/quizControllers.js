import pool from "../database/config.js";
import isNumber from "../utils/isNumber.js";
import defaultCardImages from "../utils/defaultCardImages.js";
import "dotenv/config";

const createQuiz = async (req, res) => {
  try {
    const userID = req.session.user.id;
    let { quizName, description, imageURL } = req.body;

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

    // If no imageURL was provided by the user, pick a random image for this quiz
    if (!imageURL) {
      imageURL =
        defaultCardImages[
          Math.round(Math.random() * (defaultCardImages.length - 1))
        ];
    }

    // Insert the new quiz
    const createQuizQuery =
      "INSERT INTO quiz (title, description, image_url, member_id) VALUES ($1, $2, $3, $4) RETURNING *";
    const result = await pool.query(createQuizQuery, [
      quizName,
      description,
      imageURL,
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
        await pool.query(insertQuestionAttempt, [
          newAttemptID,
          questionID,
          answer.answer_id,
          answer.isChosen,
        ]);
      }
    }

    return res.status(200).json({attemptID: newAttemptID});
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const getAttempt = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { attemptID } = req.params;

    // Verify that the attemptID is a number
    if (!isNumber(attemptID)) {
      return res.sendStatus(400);
    }

    // Verify that the attemptID exists
    const findAttemptQuery = "SELECT * FROM attempt WHERE attempt_id = $1";
    const findAttemptResult = await pool.query(findAttemptQuery, [attemptID]);
    if (!findAttemptResult.rowCount) {
      return res
        .status(404)
        .json({ error: `Quiz attempt with ID '${attemptID}' not found` });
    }

    // Verify that the client has permission to access the attempt (must be a Teacher or the Student who made the attempt)
    if (!req.session.user.isTeacher) {
      const verifyPermissionQuery =
        "SELECT * FROM attempt WHERE attempt_id = $1 AND member_id = $2";
      const verifyPermissionResult = await pool.query(verifyPermissionQuery, [
        attemptID,
        userID,
      ]);

      if (!verifyPermissionResult.rowCount) {
        return res.sendStatus(403);
      }
    }

    // Retrieve the quiz attempt and return it
    const getAttemptQuery = `WITH question_answers AS (
      SELECT
        q.quiz_id,
        q.title AS quiz_title,
        qn.question_id,
        qn.content AS question_content,
        json_agg(
          json_build_object(
            'answer_id', ans.answer_id,
            'content', ans.content,
            'is_correct', ans.is_correct,
            'was_selected', aa.was_selected
          )
        ) AS answers
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
        a.attempt_id = $1
      GROUP BY
        q.quiz_id, q.title, qn.question_id, qn.content
    )
    SELECT
      json_build_object(
        'quiz_id', quiz_id,
        'quiz_title', quiz_title,
        'questions', json_agg(
          json_build_object(
            'question_id', question_id,
            'content', question_content,
            'answers', answers
          )
        )
      ) AS quiz_attempt
    FROM
      question_answers
    GROUP BY
      quiz_id, quiz_title;`;

    const getAttemptResult = await pool.query(getAttemptQuery, [attemptID]);

    return res.status(200).json(getAttemptResult.rows[0]);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const editQuestion = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const quizID = req.params.quizID;
    const questionID = req.params.questionID;

    const { questionText, answers } = req.body;

    console.log(req.body);

    // Verify that the quizID and questionID are both numbers
    if (!isNumber(quizID) || !isNumber(questionID)) {
      return res.sendStatus(400);
    }

    // Verify body properties are present
    if (!questionText || !answers) {
      return res.sendStatus(400);
    }

    // Verify that the client has permission to edit questions in this quiz (must own the quiz)
    const findQuizQuery =
      "SELECT * FROM quiz WHERE quiz_id = $1 AND member_id = $2";
    const findQuizResult = await pool.query(findQuizQuery, [quizID, userID]);
    if (!findQuizResult.rowCount) {
      return res.sendStatus(403);
    }

    // Edit the question
    const editQuestionQuery =
      "UPDATE question SET content = $1 WHERE question_id = $2";
    const editQuestionResult = await pool.query(editQuestionQuery, [
      questionText,
      questionID,
    ]);

    // Edit the answers
    for (const answer of answers) {
      const editAnswerQuery =
        "UPDATE answer SET content = $1, is_correct = $2 WHERE answer_id = $3";
      await pool.query(editAnswerQuery, [
        answer.answerText,
        answer.isCorrect,
        answer.id
      ]);
    }

    return res.status(200).json({ message: "Question edited successfully" });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}

export { createQuiz, getQuiz, addQuestion, addAttempt, getAttempt, editQuestion };
