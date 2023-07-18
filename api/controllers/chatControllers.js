import pool from "../database/config.js";
import isNumber from "../utils/isNumber.js";
import "dotenv/config";

const createRoom = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { roomName } = req.body;

    // Verify that the request body contains the roomName property
    if(!roomName) {
      return res.status(400).json({
        error: "Request body is missing required properties",
      })
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
    const newRoom = await pool.query(insertNewRoom, [roomName, new Date(), userID]);

    // Return success message and an object containing the newly inserted room data
    return res
      .status(200)
      .json({ message: `Room '${roomName}' created successfully`, room: newRoom.rows[0] });
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
    if(!findRoomResult.rowCount) {
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
    if(!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that a room with the specified roomID exists, return 404 if not
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const findRoomResult = await pool.query(findRoomQuery, [roomID]);
    if(!findRoomResult.rowCount) {
      return res.sendStatus(404);
    }

    const getMessagesQuery = "SELECT * FROM message WHERE room_id = $1";
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
    if(!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that the request body contains the required properties
    if(!content || !authorID) {
      return res.sendStatus(400);
    }

    // Verify that a room with the specified roomID exists, return 404 if not
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const findRoomResult = await pool.query(findRoomQuery, [roomID]);
    if(!findRoomResult.rowCount) {
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
    if(!isNumber(roomID) || !isNumber(messageID)) {
      return res.sendStatus(400);
    }

    // Verify that the specified messageID exists
    const findMessageQuery = "SELECT * FROM message WHERE message_id = $1";
    const findMessageResult = await pool.query(findMessageQuery, [messageID]);
    if(!findMessageResult.rowCount) {
      return res.sendStatus(404);
    }

    // If the user is a Student, verify that the message they wish to delete is their own (Students may only delete their own messages)
    if (!req.session.user.isTeacher) {
      const confirmOwnershipQuery =
        "SELECT * FROM message WHERE message_id = $1 AND room_id = $2 AND member_id = $3";
      const result = await pool.query(confirmOwnershipQuery, [
        messageID,
        roomID,
        userID,
      ]);
      if (!result.rowCount) {
        return res.sendStatus(401);
      }
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
    if(!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that the chatroom exists
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const result = await pool.query(findRoomQuery, [roomID]);

    // If no chatroom with the specified ID is found, return 404
    if (!result.rowCount) {
      return res.status(404).json({error: `Chatroom with ID '${roomID}' not found`});
    }

    // Otherwise, return room details
    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const addUsersToChat = async (req, res) => {

  // Instantiate a new pg Client. (Need to use pg 'Client.query()' instead of 'Pool.query()' for transaction queries)
  const client = await pool.connect();

  try {

    const roomID = req.params.roomID;
    const userID = req.session.user.id;
    const newMembers = req.body;

    // Verify that the roomID contains only digits
    if(!isNumber(roomID)) {
      return res.sendStatus(400);
    }

    // Verify that the request body is not empty
    if(!newMembers.length) {
      return res.sendStatus(400)
    }
  
    // Verify that the chatroom exists
    const findRoomQuery = "SELECT * FROM room WHERE room_id = $1";
    const findRoomResult = await pool.query(findRoomQuery, [roomID]);

     // If no chatroom with the specified ID is found, return 404
     if (!findRoomResult.rowCount) {
      return res.status(404).json({error: `Chatroom with ID '${roomID}' not found`});
    }


    // Verify that the client has permission to add Users to the room (Users can only be added to room by the Teacher who owns the chat)
    const verifyOwnershipQuery = "SELECT * FROM room WHERE room_id = $1 AND member_id = $2";
    const verifyOwnershipResult = await pool.query(verifyOwnershipQuery, [roomID, userID]);

    // If the requesting client does not own the chatroom, return 403
    if (!verifyOwnershipResult.rowCount) {
      return res.status(403).json({error: "You do not have permission to add users to this chatroom"});
    }

    // Otherwise, add the users to the chatroom and return 204 (Transaction is used for these INSERT statements)
    const addMemberQuery = "INSERT INTO room_member (room_id, member_id) VALUES ($1, $2)";

    await client.query("BEGIN"); // Begin transaction

    // Insert all users into the room_member table so they become members of the chatroom
    newMembers.forEach( async (newMember) => {

      // Verify that the user exists
      const findUserQuery = "SELECT member_id FROM member WHERE email = $1";
      const findUserResult = await client.query(findUserQuery, [newMember]);

      // Throw an error if user does not exist
      if (!findUserResult.rowCount) {
        throw new Error(`No user with the email '${newMember}' exists`);
      }

      const memberID = findUserResult.rows[0].member_id;

      await client.query(addMemberQuery, [roomID, memberID]);

    });

    // Commit transaction and return 200 if all new members were successfully added to the chat room
    await client.query("COMMIT");
    return res.status(200).json({message: `${newMembers.length} members added to room ${roomID}`});

  } catch (error) {
    console.error(error);
    await client.query("ROLLBACK"); // Roll back all previous queries if an error occurs during the insertions
    return res.sendStatus(500);

  } finally {
    client.release();
  }
}

export {
  getChatByID,
  getMessages,
  postMessage,
  deleteMessage,
  createRoom,
  deleteRoom,
  addUsersToChat
};
