import pool from "../database/config.js";
import isNumber from "../utils/isNumber.js";

const createPrompt = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { content } = req.body;

    // Verify that the prompt content is not empty
    if (!content) {
      return res.sendStatus(400);
    }

    // Insert the prompt
    const insertPromptQuery =
      "INSERT INTO prompt (content, member_id) VALUES ($1, $2) RETURNING *";
    const result = await pool.query(insertPromptQuery, [content, userID]);

    return res.status(200).json({
      message: "Prompt created successfully",
      promptID: result.rows[0].prompt_id,
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const getPrompt = async (req, res) => {
  try {
    const promptID = req.params.promptID;

    // Verify that the promptID is a number
    if (!isNumber(promptID)) {
      return res.sendStatus(400);
    }

    // Verify that the promptID exists
    const getPromptQuery = "SELECT * FROM prompt WHERE prompt_id = $1";
    const getPromptResult = await pool.query(getPromptQuery, [promptID]);
    if (!getPromptResult.rowCount) {
      return res.sendStatus(404);
    }

    // Return the prompt
    return res.status(200).json(getPromptResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const postResponse = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const promptID = req.params.promptID;

    const { content } = req.body;

    // Verify that the promptID is a number
    if (!isNumber(promptID)) {
      return res.sendStatus(400);
    }

    // Verify that the response content is not empty
    if (!content) {
      return res.sendStatus(400);
    }

    // Verify that the promptID exists
    const getPromptQuery = "SELECT * FROM prompt WHERE prompt_id = $1";
    const getPromptResult = await pool.query(getPromptQuery, [promptID]);
    if (!getPromptResult.rowCount) {
      return res.sendStatus(404);
    }

    // Ensure that this user has not already responded to the prompt
    const checkForDuplicates = "SELECT * FROM response WHERE prompt_id = $1 AND member_id = $2";
    const result = await pool.query(checkForDuplicates, [promptID, userID]);
    if(result.rowCount) {
      return res.status(409).json({error: "You have already responded to this prompt!"});
    }

    // Insert the response and link it to the prompt
    const insertResponseQuery =
      "INSERT INTO response (content, prompt_id, member_id) VALUES ($1, $2, $3)";
    await pool.query(insertResponseQuery, [content, promptID, userID]);

    res.status(200).json({ message: "Response added successfully" });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const getResponses = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const promptID = req.params.promptID;

    // Verify that the promptID is a number
    if (!isNumber(promptID)) {
      return res.sendStatus(400);
    }

    // Verify that the promptID exists
    const getPromptQuery = "SELECT * FROM prompt WHERE prompt_id = $1";
    const getPromptResult = await pool.query(getPromptQuery, [promptID]);
    if (!getPromptResult.rowCount) {
      return res.sendStatus(404);
    }

    // Verify that the client has permission to view the responses (must own the prompt)
    if(!getPromptResult.rows[0].member_id === userID) {
      return res.sendStatus(403);
    }

    // Retrieve and return all responses for the prompt
    const getResponsesQuery = "SELECT * FROM response WHERE prompt_id = $1";
    const getResponsesResult = await pool.query(getResponsesQuery, [promptID]);

    return res.status(200).json(getResponsesResult.rows);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export { createPrompt, getPrompt, postResponse, getResponses };
