import pool from "../database/config.js";
import isNumber from "../utils/isNumber.js";
import "dotenv/config";
import parseEnrolmentCsv from "../utils/parseEnrolmentCsv.js";
import validateCsv from "../utils/validateCsv.js";
import defaultCardImages from "../utils/defaultCardImages.js";
import groupLikesByMessage from "../utils/groupLikesByMessage.js";
import { Configuration, OpenAIApi } from "openai";
import "dotenv/config";

const createRoom = async (req, res) => {
  try {
    const userID = req.session.user.id;
    let { roomName, description, imageURL } = req.body;

    // Verify that the request body contains the roomName property
    if (!roomName) {
      return res.status(400).json({
        error: "Request body is missing the required property 'roomName'",
      });
    }

    // Ensure description is below the maximum allowed length
    if (description && description.length > 100) {
      return res.status(400).json({
        error: "Room description must not be longer than 100 characters",
      });
    }

    // Check that this user does not already have a room with the same name
    const findDuplicateRooms =
      "SELECT * FROM room WHERE member_id = $1 AND title = $2";
    const result = await pool.query(findDuplicateRooms, [userID, roomName]);

    if (result.rowCount) {
      return res.status(409).json({
        error: `A room named '${roomName}' already exists for this user. Please choose another name.`,
      });
    }

    // If no imageURL was provided by the user, pick a random image for this room
    if (!imageURL) {
      imageURL =
        defaultCardImages[
          Math.round(Math.random() * (defaultCardImages.length - 1))
        ];
    }

    // Insert new room into the DB and retrieve the room_id
    const insertNewRoom =
      "INSERT INTO room (title, description, image_url, creation_date, member_id) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const newRoom = await pool.query(insertNewRoom, [
      roomName,
      description,
      imageURL,
      new Date(),
      userID,
    ]);

    // Return success message and an object containing the newly inserted room data
    return res.status(200).json({
      message: `Room '${roomName}' created successfully`,
      room: newRoom.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const deleteRoom = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const roomID = req.params.roomID;

    if (!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that a room with the specified roomID exists, return 404 if not
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const findRoomResult = await pool.query(findRoomQuery, [roomID]);
    if (!findRoomResult.rowCount) {
      return res.sendStatus(404);
    }

    // Check that the user owns the room they are attempting to delete, return 403 if they do not.
    const checkOwnership =
      "SELECT * FROM room WHERE room_id = $1 AND member_id = $2";
    const result = await pool.query(checkOwnership, [roomID, userID]);
    if (!result.rowCount) {
      return res.sendStatus(403);
    }

    // Delete the room and return 204
    const deleteRoom = "DELETE FROM room WHERE room_id = $1 AND member_id = $2";
    await pool.query(deleteRoom, [roomID, userID]);

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const getMessages = async (req, res) => {
  try {
    const roomID = req.params.roomID;

    // Verify that the roomID parameter contains only digits
    if (!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that a room with the specified roomID exists, return 404 if not
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const findRoomResult = await pool.query(findRoomQuery, [roomID]);
    if (!findRoomResult.rowCount) {
      return res.sendStatus(404);
    }

    // Retrieve all messages for the specified chat room together with their likes. Order by message insertion so they can be displayed chronologically on the frontend.
    const getMessagesQuery = `SELECT
    message.message_id,
    message.content,
    message.timestamp,
    message.room_id,
    message.member_id,
    message.quiz_id,
    message.hidden,
    message.quiz_ended,
    message.prompt_id,
    parent.message_id AS parent_id,
    parent.hidden AS parent_hidden,
    CASE
        WHEN parent.hidden = true THEN '*** Message Hidden ***'
        ELSE parent.content
    END AS parent_content,
    likes.member_id AS liker_id
    FROM message
    LEFT JOIN message
    AS parent ON 
    message.parent_id = parent.message_id
    LEFT JOIN
    likes ON message.message_id = likes.message_id
    LEFT JOIN
    room ON message.room_id = room.room_id
    WHERE message.room_id = $1
    ORDER BY
    message.message_id ASC`;
    const result = await pool.query(getMessagesQuery, [roomID]);

    // Format the result set so that each message object contains an array of likes
    const messagesWithLikes = groupLikesByMessage(result);

    return res.status(200).json(messagesWithLikes);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const postMessage = async (req, res) => {
  try {
    const roomID = req.params.roomID;
    const { content, authorID, parentID, quizID, promptID } = req.body;

    // Verify that the roomID parameter contains only digits
    if (!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that the request body contains the required properties
    if (!content || !authorID) {
      return res.sendStatus(400);
    }

    // Verify that a room with the specified roomID exists, return 404 if not
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const findRoomResult = await pool.query(findRoomQuery, [roomID]);
    if (!findRoomResult.rowCount) {
      return res.sendStatus(404);
    }

    // Verify that the room is not set as 'read only'
    if (findRoomResult.rows[0].read_only) {
      return res.status(403).json({
        error: `Error: Failed to post message. Room is set to 'read-only'`,
      });
    }

    const addMessageQuery =
      "INSERT INTO message (content, timestamp, room_id, parent_id, member_id, quiz_id, prompt_id) VALUES ($1, $2, $3, $4, $5, $6, $7)";
    await pool.query(addMessageQuery, [
      content,
      new Date(),
      roomID,
      parentID,
      authorID,
      quizID || null,
      promptID || null,
    ]);

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const deleteMessage = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const roomID = req.params.roomID;
    const messageID = req.params.messageID;

    // Verify that the roomID and messageID parameters only contain digits
    if (!isNumber(roomID) || !isNumber(messageID)) {
      return res.sendStatus(400);
    }

    // Verify that the specified messageID exists
    const findMessageQuery = "SELECT * FROM message WHERE message_id = $1";
    const findMessageResult = await pool.query(findMessageQuery, [messageID]);
    if (!findMessageResult.rowCount) {
      return res.sendStatus(404);
    }

    const deleteMessageQuery =
      "DELETE FROM message WHERE message_id = $1 AND room_id = $2";
    await pool.query(deleteMessageQuery, [messageID, roomID]);

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const getChatByID = async (req, res) => {
  try {
    const roomID = req.params.roomID;

    // Verify that the roomID parameter contains only numbers
    if (!isNumber(roomID)) {
      return res.status(400).json({
        error: "The Room ID must contain only numeric characters (0-9)",
      });
    }

    // Verify that the chatroom exists
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const result = await pool.query(findRoomQuery, [roomID]);

    // If no chatroom with the specified ID is found, return 404
    if (!result.rowCount) {
      return res
        .status(404)
        .json({ error: `Chatroom with ID '${roomID}' not found` });
    }

    // Otherwise, return room details
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const enrolStudentsManually = async (req, res) => {
  try {
    const roomID = req.params.roomID;
    const userID = req.session.user.id;
    const teacherEmails = req.body;

    const successfulEnrolments = new Set();
    const failedEnrolments = new Set();
    const duplicateEnrolments = new Set();

    // Verify that the roomID contains only digits
    if (!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that the request body is not empty
    if (!teacherEmails.length) {
      return res.sendStatus(400);
    }

    // Verify that the chatroom exists
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const findRoomResult = await pool.query(findRoomQuery, [roomID]);

    // If no chatroom with the specified ID is found, return 404
    if (!findRoomResult.rowCount) {
      return res
        .status(404)
        .json({ error: `Chatroom with ID '${roomID}' not found` });
    }

    const roomName = findRoomResult.rows[0].title;

    // Verify that the client has permission to add Users to the room (Users can only be added to room by the Teacher who owns the chat)
    const verifyOwnershipQuery =
      "SELECT * FROM room WHERE room_id = $1 AND member_id = $2";
    const verifyOwnershipResult = await pool.query(verifyOwnershipQuery, [
      roomID,
      userID,
    ]);

    // If the requesting client does not own the chatroom, return 403
    if (!verifyOwnershipResult.rowCount) {
      return res.status(403).json({
        error: "You do not have permission to add users to this chatroom",
      });
    }

    // Otherwise, enrol the Students in the chatroom
    const addMemberQuery =
      "INSERT INTO room_member (room_id, member_id) VALUES ($1, $2)";
    for (const teacherEmail of teacherEmails) {
      // Verify that the Student exists
      const findUserQuery =
        "SELECT member_id FROM member WHERE student_number = $1";
      const findUserResult = await pool.query(findUserQuery, [teacherEmail]);

      // If the Student is not found, add the student number to the failedEnrolments array and skip to the next iteration
      if (!findUserResult.rowCount) {
        failedEnrolments.add(teacherEmail);
        continue;
      }

      // Check if the Student is already enrolled in this chatroom. If so, add the student number to the duplicateEnrolments arrays and skip to the next iteration
      const memberID = findUserResult.rows[0].member_id;
      const checkDuplicateEnrolmentQuery =
        "SELECT * FROM room_member WHERE member_id = $1 AND room_id = $2";
      const checkDuplicateEnrolmentResult = await pool.query(
        checkDuplicateEnrolmentQuery,
        [memberID, roomID]
      );

      if (checkDuplicateEnrolmentResult.rowCount) {
        duplicateEnrolments.add(teacherEmail);
        continue;
      }

      // Otherwise add the Student to the chat room and record the successful enrollment
      const studentID = findUserResult.rows[0].member_id;
      await pool.query(addMemberQuery, [roomID, studentID]);
      successfulEnrolments.add(teacherEmail);
    }

    // If all enrolments did not succeed return '207 multi-status' with lists of both successful and failed enrolments
    if (failedEnrolments.size > 0 || duplicateEnrolments.size > 0) {
      return res.status(207).json({
        message: `${
          successfulEnrolments.size
        } member(s) added to the '${roomName}' chat room. ${
          failedEnrolments.size + duplicateEnrolments.size
        } enrolment(s) failed.`,
        successfulEnrolments: Array.from(successfulEnrolments),
        failedEnrolments: Array.from(failedEnrolments),
        duplicateEnrolments: Array.from(duplicateEnrolments),
      });
    }

    // If all enrolments suceeded, return 200 and a success message and the list of successful enrolments.
    return res.status(200).json({
      message: `${successfulEnrolments.size} members added to the '${roomName}' chatroom`,
    });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const batchEnrolStudents = async (req, res) => {
  try {
    const roomID = req.params.roomID;
    const userID = req.session.user.id;

    const successfulEnrolments = new Set();
    const failedEnrolments = new Set();
    const duplicateEnrolments = new Set();

    // Verify that the roomID contains only digits
    if (!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that the chatroom exists
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const findRoomResult = await pool.query(findRoomQuery, [roomID]);

    // If no chatroom with the specified ID is found, return 404
    if (!findRoomResult.rowCount) {
      return res
        .status(404)
        .json({ error: `Chatroom with ID '${roomID}' not found` });
    }

    const roomName = findRoomResult.rows[0].title;

    // Verify that the client has permission to add Users to the room (Users can only be added to room by the Teacher who owns the chat)
    const verifyOwnershipQuery =
      "SELECT * FROM room WHERE room_id = $1 AND member_id = $2";
    const verifyOwnershipResult = await pool.query(verifyOwnershipQuery, [
      roomID,
      userID,
    ]);

    // If the requesting client does not own the chatroom, return 403
    if (!verifyOwnershipResult.rowCount) {
      return res.status(403).json({
        error: "You do not have permission to add users to this chatroom",
      });
    }

    // Check if a file was uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No file was uploaded" });
    }

    const { csvFile } = req.files;

    // Check if the uploaded file is a .csv file
    if (!csvFile || !csvFile.name.endsWith(".csv")) {
      return res.status(400).json({
        error:
          "The uploaded file could not be processed because it was not a '.csv' file",
      });
    }

    // Validate the CSV file to ensure the format is correct
    if (!(await validateCsv(csvFile))) {
      return res.status(400).json({
        error:
          "The CSV file failed validation. Please visit the 'Help' page for the correct CSV file structure.",
      });
    }

    // Parse the student numbers from the csv file
    const studentNumbers = await parseEnrolmentCsv(csvFile);

    // Enrol the Students in the chatroom
    const addMemberQuery =
      "INSERT INTO room_member (room_id, member_id) VALUES ($1, $2)";
    for (const studentNumber of studentNumbers) {
      // Verify that the Student exists
      const findUserQuery =
        "SELECT member_id FROM member WHERE student_number = $1";
      const findUserResult = await pool.query(findUserQuery, [studentNumber]);

      // If the Student is not found, add the student number to the failedEnrolments array and skip to the next iteration
      if (!findUserResult.rowCount) {
        failedEnrolments.add(studentNumber);
        continue;
      }

      // Check if the Student is already enrolled in this chatroom. If so, add the student number to the duplicateEnrolments array and skip to the next iteration
      const memberID = findUserResult.rows[0].member_id;
      const checkDuplicateEnrolmentQuery =
        "SELECT * FROM room_member WHERE member_id = $1 AND room_id = $2";
      const checkDuplicateEnrolmentResult = await pool.query(
        checkDuplicateEnrolmentQuery,
        [memberID, roomID]
      );

      if (checkDuplicateEnrolmentResult.rowCount) {
        duplicateEnrolments.add(studentNumber);
        continue;
      }

      // Otherwise add the Student to the chat room and record the successful enrollment
      const studentID = findUserResult.rows[0].member_id;
      await pool.query(addMemberQuery, [roomID, studentID]);
      successfulEnrolments.add(studentNumber);
    }

    // If all enrolments did not succeed return '207 multi-status' with lists of successful and failed enrolments
    if (failedEnrolments.size > 0 || duplicateEnrolments.size > 0) {
      return res.status(207).json({
        message: `${
          successfulEnrolments.size
        } member(s) added to the '${roomName}' chat room. ${
          failedEnrolments.size + duplicateEnrolments.size
        } enrolment(s) failed.`,
        successfulEnrolments: Array.from(successfulEnrolments),
        failedEnrolments: Array.from(failedEnrolments),
        duplicateEnrolments: Array.from(duplicateEnrolments),
      });
    }

    // If all enrolments suceeded, return 200 and a success message
    return res.status(200).json({
      message: `${successfulEnrolments.length} members added to the '${roomName}' chat room`,
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const enrolTeachers = async (req, res) => {
  try {
    const roomID = req.params.roomID;
    const userID = req.session.user.id;
    const teacherEmails = req.body;

    const successfulEnrolments = new Set();
    const failedEnrolments = new Set();
    const duplicateEnrolments = new Set();

    // Verify that the roomID contains only digits
    if (!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that the request body is not empty
    if (!teacherEmails.length) {
      return res.sendStatus(400);
    }

    // Verify that the chatroom exists
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const findRoomResult = await pool.query(findRoomQuery, [roomID]);

    // If no chatroom with the specified ID is found, return 404
    if (!findRoomResult.rowCount) {
      return res
        .status(404)
        .json({ error: `Chatroom with ID '${roomID}' not found` });
    }

    const roomName = findRoomResult.rows[0].title;

    // Verify that the client has permission to add Users to the room (Users can only be added to room by the Teacher who owns the chat)
    const verifyOwnershipQuery =
      "SELECT * FROM room WHERE room_id = $1 AND member_id = $2";
    const verifyOwnershipResult = await pool.query(verifyOwnershipQuery, [
      roomID,
      userID,
    ]);

    // If the requesting client does not own the chatroom, return 403
    if (!verifyOwnershipResult.rowCount) {
      return res.status(403).json({
        error: "You do not have permission to add users to this chatroom",
      });
    }

    // Otherwise, add the Teacher to the chatroom
    const addMemberQuery =
      "INSERT INTO room_member (room_id, member_id) VALUES ($1, $2)";
    for (const teacherEmail of teacherEmails) {
      // Verify that the Teacher exists
      const findUserQuery =
        "SELECT member_id FROM member WHERE email = $1 AND is_teacher = $2";
      const findUserResult = await pool.query(findUserQuery, [
        teacherEmail,
        true,
      ]);

      // If the Teacher is not found, add their email to the failedEnrolments array and skip to the next iteration
      if (!findUserResult.rowCount) {
        failedEnrolments.add(teacherEmail);
        continue;
      }

      // Check if the Teacher is already enrolled in this chatroom. If so, add their email to the duplicateEnrolments array and skip to the next iteration
      const memberID = findUserResult.rows[0].member_id;
      const checkDuplicateEnrolmentQuery =
        "SELECT * FROM room_member WHERE member_id = $1 AND room_id = $2";
      const checkDuplicateEnrolmentResult = await pool.query(
        checkDuplicateEnrolmentQuery,
        [memberID, roomID]
      );

      if (checkDuplicateEnrolmentResult.rowCount) {
        duplicateEnrolments.add(teacherEmail);
        continue;
      }

      // Otherwise add the Teacher to the chat room and record the successful enrollment
      const studentID = findUserResult.rows[0].member_id;
      await pool.query(addMemberQuery, [roomID, studentID]);
      successfulEnrolments.add(teacherEmail);
    }

    // If all enrolments did not succeed return '207 multi-status' with lists of both successful and failed enrolments
    if (failedEnrolments.size > 0 || duplicateEnrolments.size > 0) {
      return res.status(207).json({
        message: `${
          successfulEnrolments.size
        } Teachers(s) added to the '${roomName}' chat room. ${
          failedEnrolments.size + duplicateEnrolments.size
        } enrolment(s) failed.`,
        successfulEnrolments: Array.from(successfulEnrolments),
        failedEnrolments: Array.from(failedEnrolments),
        duplicateEnrolments: Array.from(duplicateEnrolments),
      });
    }

    // If all enrolments suceeded, return 200 and a success message and the list of successful enrolments.
    return res.status(200).json({
      message: `${successfulEnrolments.size} Teachers added to the '${roomName}' chatroom`,
    });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const hideMessage = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const roomID = req.params.roomID;
    const messageID = req.params.messageID;

    // Verify that the roomID and messageID parameters only contain digits
    if (!isNumber(roomID) || !isNumber(messageID)) {
      return res.sendStatus(400);
    }

    // Verify that the specified messageID exists
    const findMessageQuery = "SELECT * FROM message WHERE message_id = $1";
    const findMessageResult = await pool.query(findMessageQuery, [messageID]);
    if (!findMessageResult.rowCount) {
      return res.sendStatus(404);
    }

    const authorID = findMessageResult.rows[0].member_id;

    // Verify that the client has permission to un-hide messages (must be a Teacher or the message author)
    if (userID !== authorID && !req.session.user.isTeacher) {
      return res
        .status(403)
        .json({ error: "You do not have permission to un-hide this message" });
    }

    // Set the specified message as hidden
    const hideMessageQuery =
      "UPDATE message SET hidden = true WHERE message_id = $1";
    await pool.query(hideMessageQuery, [messageID]);

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const showMessage = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const roomID = req.params.roomID;
    const messageID = req.params.messageID;

    // Verify that the roomID and messageID parameters only contain digits
    if (!isNumber(roomID) || !isNumber(messageID)) {
      return res.sendStatus(400);
    }

    // Verify that the specified messageID exists
    const findMessageQuery = "SELECT * FROM message WHERE message_id = $1";
    const findMessageResult = await pool.query(findMessageQuery, [messageID]);
    if (!findMessageResult.rowCount) {
      return res.sendStatus(404);
    }

    const authorID = findMessageResult.rows[0].member_id;

    // Verify that the client has permission to un-hide messages (must be a Teacher or the message author)
    if (userID !== authorID && !req.session.user.isTeacher) {
      return res
        .status(403)
        .json({ error: "You do not have permission to un-hide this message" });
    }

    // Set the specified message as not hidden
    const hideMessageQuery =
      "UPDATE message SET hidden = false WHERE message_id = $1";
    await pool.query(hideMessageQuery, [messageID]);

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const hideRoom = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const roomID = req.params.roomID;

    // Verify that the roomID parameter only contains digits
    if (!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that the specified roomID exists
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const findRoomResult = await pool.query(findRoomQuery, [roomID]);
    if (!findRoomResult.rowCount) {
      return res.sendStatus(404);
    }

    const roomOwnerID = findRoomResult.rows[0].member_id;

    // Verify that the client has permission to hide the room (must be the room owner)
    if (userID !== roomOwnerID) {
      return res
        .status(403)
        .json({ error: "You do not have permission to hide this room" });
    }

    // Set the specified room as hidden
    const hideRoomQuery = "UPDATE room SET hidden = true WHERE room_id = $1";
    await pool.query(hideRoomQuery, [roomID]);

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const showRoom = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const roomID = req.params.roomID;

    // Verify that the roomID parameter only contains digits
    if (!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that the specified roomID exists
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const findRoomResult = await pool.query(findRoomQuery, [roomID]);
    if (!findRoomResult.rowCount) {
      return res.sendStatus(404);
    }

    const roomOwnerID = findRoomResult.rows[0].member_id;

    // Verify that the client has permission to un-hide the room (must be the room owner)
    if (userID !== roomOwnerID) {
      return res
        .status(403)
        .json({ error: "You do not have permission to un-hide this room" });
    }

    // Set the specified room as not hidden
    const unHideRoomQuery = "UPDATE room SET hidden = false WHERE room_id = $1";
    await pool.query(unHideRoomQuery, [roomID]);

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const likeMessage = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const messageID = req.params.messageID;

    // Verify that the messageID parameter only contains digits
    if (!isNumber(messageID)) {
      return res.sendStatus(400);
    }

    // Verify that the specified messageID exists
    const findMessageQuery = "SELECT * FROM message WHERE message_id = $1";
    const findMessageResult = await pool.query(findMessageQuery, [messageID]);
    if (!findMessageResult.rowCount) {
      return res.sendStatus(404);
    }

    // Verify client has permission to like this message (must be owner or member of the chatroom where the message was posted)
    const roomID = findMessageResult.rows[0].room_id;
    const checkRoomMemberQuery =
      "SELECT * FROM room_member WHERE room_id = $1 AND member_id = $2";
    const checkRoomMemberResult = await pool.query(checkRoomMemberQuery, [
      roomID,
      userID,
    ]);

    if (!checkRoomMemberResult.rowCount) {
      const checkRoomOwnerQuery =
        "SELECT * FROM room WHERE room_id = $1 AND member_id = $2";
      const checkRoomOwnerResult = await pool.query(checkRoomOwnerQuery, [
        roomID,
        userID,
      ]);

      // If the client is neither the room owner or a room member, return 403 Forbidden status
      if (!checkRoomOwnerResult.rowCount) {
        return res
          .status(403)
          .json({ error: "You do not have permission to like this message" });
      }
    }

    // Verify that the client has not already liked this message
    const duplicateLikesQuery =
      "SELECT * FROM likes WHERE member_id = $1 AND message_id = $2";
    const duplicateLikesResult = await pool.query(duplicateLikesQuery, [
      userID,
      messageID,
    ]);
    if (duplicateLikesResult.rowCount) {
      return res
        .status(409)
        .json({ error: "You have already liked this message" });
    }

    // Insert the new like
    const insertLikeQuery =
      "INSERT INTO likes (message_id, member_id) VALUES ($1, $2)";
    await pool.query(insertLikeQuery, [messageID, userID]);

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const unlikeMessage = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const messageID = req.params.messageID;

    // Verify that the messageID parameter only contains digits
    if (!isNumber(messageID)) {
      return res.sendStatus(400);
    }

    // Verify that the specified messageID exists
    const findMessageQuery = "SELECT * FROM message WHERE message_id = $1";
    const findMessageResult = await pool.query(findMessageQuery, [messageID]);
    if (!findMessageResult.rowCount) {
      return res.sendStatus(404);
    }

    // Verify client has permission to un-like this message (must have already liked it)
    const checkLikeQuery =
      "SELECT * FROM likes WHERE message_id = $1 AND member_id = $2";
    const checkLikeResult = await pool.query(checkLikeQuery, [
      messageID,
      userID,
    ]);

    if (!checkLikeResult.rowCount) {
      return res
        .status(403)
        .json({ error: "You do not have permission to un-like this message" });
    }

    // Delete the like
    const deleteLikeQuery =
      "DELETE FROM likes WHERE message_id = $1 AND member_id = $2";
    await pool.query(deleteLikeQuery, [messageID, userID]);

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const changeReadOnlyStatus = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const roomID = req.params.roomID;

    const { readOnly } = req.body; // A boolean value indicating whether the room should be set/unset as 'read-only'

    // Verify the request body contains the required property
    if (readOnly === null || readOnly === undefined) {
      return res.status(400).json({
        error:
          "Request body must contain the 'readOnly' property with a value of 'true' or 'false'",
      });
    }

    // Verify that the roomID parameter only contains digits
    if (!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that the specified roomID exists
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const findRoomResult = await pool.query(findRoomQuery, [roomID]);
    if (!findRoomResult.rowCount) {
      return res.sendStatus(404);
    }

    // Verify that the client has permission to set the read-only status (must own the chat room)
    const verifyPermissionQuery =
      "SELECT * from room WHERE room_id = $1 AND member_id = $2";
    const verifyPermissionResult = await pool.query(verifyPermissionQuery, [
      roomID,
      userID,
    ]);
    if (!verifyPermissionResult.rowCount) {
      return res.sendStatus(403);
    }

    // Set the read-only status of the room
    const setReadOnlyQuery =
      "UPDATE room SET read_only = $1 WHERE room_id = $2";
    await pool.query(setReadOnlyQuery, [readOnly, roomID]);

    return res.status(200).json({
      message: `Read-only status of room '${roomID}' set to ''${readOnly}`,
    });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

// Links a quiz attempt to a message which contains a quiz - so results can be displayed after quiz is submitted
const endQuiz = async (req, res) => {
  try {
    const messageID = req.params.messageID;

    // Verify that the messageID only contains digits
    if (!isNumber(messageID)) {
      return res.sendStatus(400);
    }

    // Verify that the messageID exists and is associated with a quiz
    const findMessageQuery =
      "SELECT * FROM message WHERE message_id = $1 AND quiz_id IS NOT NULL";
    const findMessageResult = await pool.query(findMessageQuery, [messageID]);
    if (!findMessageResult.rowCount) {
      return res.sendStatus(404);
    }

    // Mark the quiz in the message as ended
    const endQuizQuery =
      "UPDATE message SET quiz_ended = true WHERE message_id = $1";
    await pool.query(endQuizQuery, [messageID]);

    return res.status(200).json({ message: "Quiz ended successfully" });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const getAnalyticsData = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const roomID = req.params.roomID;

    // Verify that the roomID is a number
    if (!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that the roomID exists
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const findRoomResult = await pool.query(findRoomQuery, [roomID]);
    if (!findRoomResult.rowCount) {
      return res.sendStatus(404);
    }

    // Verify that the client has permission to retrieve this data (must be the chatroom owner)
    if (findRoomResult.rows[0].member_id !== userID) {
      return res.sendStatus(403);
    }

    // Get the total number of enrolled members in this room
    const getMemberCount =
      "SELECT COUNT(*) AS total_member_count FROM room_member WHERE room_id = $1";
    const memberCount = await pool.query(getMemberCount, [roomID]);

    // Get the total number of messages in the room
    const getMessageCount =
      "SELECT COUNT(*) AS total_message_count FROM message WHERE room_id = $1";
    const messageCount = await pool.query(getMessageCount, [roomID]);

    // Retrieve the content of every message from this room
    const getAllMessagesQuery =
      "SELECT content, timestamp FROM message WHERE room_id = $1 ORDER BY timestamp DESC";
    const getAllMessagesResult = await pool.query(getAllMessagesQuery, [
      roomID,
    ]);

    // Concatenate all of the words from each message into a string, which we will use as the input for the Word Cloud
    const allWords = getAllMessagesResult.rows
      .map((row) => row.content) // Extract 'content' field
      .map((content) => content.split(/\s+/)) // Split into individual words
      .flat() // Flatten the array of arrays
      .join(" "); // Concatenate words into one long string

    return res.status(200).json({
      ...findRoomResult.rows[0],
      memberCount: memberCount.rows[0]?.total_member_count,
      messageCount: messageCount.rows[0]?.total_message_count,
      lastMessageTime: getAllMessagesResult.rows[0]?.timestamp,
      wordCloudData: allWords,
    });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const getSentimentData = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const roomID = req.params.roomID;

    // Verify that the roomID is a number
    if (!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that the roomID exists
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const findRoomResult = await pool.query(findRoomQuery, [roomID]);
    if (!findRoomResult.rowCount) {
      return res.sendStatus(404);
    }

    // Verify that the client has permission to retrieve this data (must be the chatroom owner)
    if (findRoomResult.rows[0].member_id !== userID) {
      return res.sendStatus(403);
    }

    // Retrieve all messages from the chat-room as one string, each message is delimited with '╡' character
    const getMessages =
      "SELECT STRING_AGG(content, '╡') AS concatenated_messages FROM message WHERE room_id = $1";
    const messages = await pool.query(getMessages, [roomID]);

    // Configure the OpenAI API client
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    if (!configuration.apiKey) {
      return res.status(500).json({
        error:
          "OpenAI API key not configured, please follow instructions in README.md",
      });
    }

    // Prompt the GPT 3.5 turbo model to perform sentiment analysis on the messages
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0, // Set temperature to 0 to achieve maximum consistency in responses (higher number allows more randomness)
      messages: [
        {
          role: "system",
          content: `Perform sentiment analysis on a string of messages delimited with the '╡'character.
            Output 1 for positive messages, -1 for negative, 0 for neutral. 
            Output only these numbers separated by commas.`,
        },
        {
          role: "user",
          content: `${messages.rows[0].concatenated_messages}`,
        },
      ],
    });

    const openAiResponse = completion.data.choices[0].message.content; // String containing the sentiment indicators for each message (1/0/-1 for positive/neutral/negative)
    console.log(openAiResponse);
    const sentimentIndicators = openAiResponse.split(",").map(Number); // Transform the response string into an Array of Numbers

    console.log(`Sentiment Indicators: ${sentimentIndicators}`);

    // Get the totals for each type of sentiment
    let positiveMessages = 0,
      neutralMessages = 0,
      negativeMessages = 0;
    sentimentIndicators.forEach((indicator) => {
      switch (indicator) {
        case 1:
          positiveMessages++;
          break;
        case 0:
          neutralMessages++;
          break;
        case -1:
          negativeMessages++;
          break;
      }
    });

    // Get the percentages for each sentiment, rounded to 2 decimal places
    const positivePercentage = parseFloat(
      ((positiveMessages / sentimentIndicators.length) * 100).toFixed(2)
    );
    const neutralPercentage = parseFloat(
      ((neutralMessages / sentimentIndicators.length) * 100).toFixed(2)
    );
    const negativePercentage = parseFloat(
      ((negativeMessages / sentimentIndicators.length) * 100).toFixed(2)
    );

    return res
      .status(200)
      .json({ positivePercentage, neutralPercentage, negativePercentage });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const getPromptReports = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const roomID = req.params.roomID;

    // Verify that the roomID is a number
    if (!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that the roomID exists
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const findRoomResult = await pool.query(findRoomQuery, [roomID]);
    if (!findRoomResult.rowCount) {
      return res.sendStatus(404);
    }

    // Verify that the client has permission to retrieve this data (must be the chatroom owner)
    if (findRoomResult.rows[0].member_id !== userID) {
      return res.sendStatus(403);
    }

    // Retrieve the list of prompts that have been posted in this room, along with the list of responses for each prompt
    const getPromptsQuery = `WITH prompts_with_responses AS (
      SELECT 
        p.prompt_id AS prompt_id,
        p.content AS prompt_content,
        json_agg(json_build_object('response_id', r.response_id, 'content', r.content)) AS responses
      FROM prompt p
      LEFT JOIN response r ON p.prompt_id = r.prompt_id
      WHERE p.room_id = $1
      GROUP BY p.prompt_id
    )
    SELECT json_agg(
        json_build_object('prompt_id', prompt_id, 'content', prompt_content, 'responses', responses)
    ) AS result
    FROM prompts_with_responses`;

    const getPromptsResult = await pool.query(getPromptsQuery, [roomID]);

    return res.status(200).json(getPromptsResult.rows);

  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export {
  getChatByID,
  getMessages,
  postMessage,
  deleteMessage,
  createRoom,
  deleteRoom,
  enrolStudentsManually,
  batchEnrolStudents,
  enrolTeachers,
  showMessage,
  hideMessage,
  showRoom,
  hideRoom,
  likeMessage,
  unlikeMessage,
  changeReadOnlyStatus,
  endQuiz,
  getAnalyticsData,
  getSentimentData,
  getPromptReports
};
