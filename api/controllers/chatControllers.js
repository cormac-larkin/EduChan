import pool from "../database/config.js";
import isNumber from "../utils/isNumber.js";
import "dotenv/config";
import parseEnrolmentCsv from "../utils/parseEnrolmentCsv.js";
import validateCsv from "../utils/validateCsv.js";

const createRoom = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { roomName } = req.body;

    // Verify that the request body contains the roomName property
    if (!roomName) {
      return res.status(400).json({
        error: "Request body is missing required properties",
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

    // Insert new room into the DB and retrieve the room_id
    const insertNewRoom =
      "INSERT INTO room (title, creation_date, member_id) VALUES ($1, $2, $3) RETURNING *";
    const newRoom = await pool.query(insertNewRoom, [
      roomName,
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

    // Retrieve all messages for the specified chat room, ordered by their insertion so they can be displayed chronologically on the frontend.
    const getMessagesQuery =
      "SELECT * FROM message WHERE room_id = $1 ORDER BY message_id ASC";
    const result = await pool.query(getMessagesQuery, [roomID]);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const postMessage = async (req, res) => {
  try {
    const roomID = req.params.roomID;
    const { content, authorID } = req.body;

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

    const addMessageQuery =
      "INSERT INTO message (content, timestamp, room_id, member_id) VALUES ($1, $2, $3, $4)";
    await pool.query(addMessageQuery, [content, new Date(), roomID, authorID]);

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
      return res.sendStatus(400);
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
      return res
        .status(400)
        .json({
          error:
            "The CSV file failed validation. Please visit the 'Help' page for the correct CSV file structure.",
        });
    }

    // Parse the student numbers from the csv file
    const teacherEmails = await parseEnrolmentCsv(csvFile);

    // Enrol the Students in the chatroom
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

      // Check if the Student is already enrolled in this chatroom. If so, add the student number to the duplicateEnrolments array and skip to the next iteration
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
        "SELECT member_id FROM member WHERE email = $1 AND is_admin = $2";
      const findUserResult = await pool.query(findUserQuery, [teacherEmail, true]);

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
      return res.status(403).json({error: "You do not have permission to un-hide this message"})
    }

    // Set the specified message as hidden
    const hideMessageQuery = "UPDATE message SET hidden = true WHERE message_id = $1";
    await pool.query(hideMessageQuery, [messageID]);

    return res.sendStatus(204);

  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

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
      return res.status(403).json({error: "You do not have permission to un-hide this message"})
    }

    // Set the specified message as not hidden
    const hideMessageQuery = "UPDATE message SET hidden = false WHERE message_id = $1";
    await pool.query(hideMessageQuery, [messageID]);

    return res.sendStatus(204);

  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}



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
  hideMessage
};
