import pool from "../database/config.js";

const getOwnedRooms = async (req, res) => {

    try {
        const userID = req.session.user.id;

        const getOwnedRooms = "SELECT * FROM room WHERE member_id = $1";
        const result = await pool.query(getOwnedRooms, [userID]);

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
}

const createRoom = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { roomName } = req.body;

    // Check that this user does not already have a room with the same name
    const findDuplicateRooms =
      "SELECT * FROM room WHERE member_id = $1 AND title = $2";
    const result = await pool.query(findDuplicateRooms, [userID, roomName]);

    if (result.rowCount) {
      return res.status(409).json({
        error: `A room named '${roomName}' already exists for this user. Please choose another name.`,
      });
    }

    // Insert new room into the DB
    const insertNewRoom =
      "INSERT INTO room (title, creation_date, member_id) VALUES ($1, $2, $3)";
    await pool.query(insertNewRoom, [roomName, new Date(), userID]);

    return res.status(200).json({ message: `Room '${roomName}' created successfully` });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const deleteRoom = async (req, res) => {
    try {
        
        const userID = req.session.user.id;
        const roomID = req.params.roomID;

        // Check that the user owns the room they are attempting to delete, return 401 if they do not.
        const checkOwnership = "SELECT * FROM room WHERE room_id = $1 AND member_id = $2";
        const result = await pool.query(checkOwnership, [roomID, userID]);
        if (!result.rowCount) {
            return res.sendStatus(401);
        }

        // Delete the room and return 204
        const deleteRoom = "DELETE FROM room WHERE room_id = $1 AND member_id = $2";
        await pool.query(deleteRoom, [roomID, userID]);

        return res.sendStatus(204);

    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
}

const getMessages = async (req, res) => {
  try {
    const roomID = req.params.roomID;

    const getMessagesQuery = "SELECT * FROM message WHERE room_id = $1";
    const result = await pool.query(getMessagesQuery, [roomID]);

    return res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

const postMessage = async (req, res) => {
  try {

    const roomID = req.params.roomID;
    const {content, authorID} = req.body;

    const addMessageQuery = "INSERT INTO message (content, timestamp, room_id, member_id) VALUES ($1, $2, $3, $4)";
    await pool.query(addMessageQuery, [content, new Date(), roomID, authorID]);

    return res.sendStatus(204);

  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

const deleteMessage = async (req, res) => {
  try {

    const userID = req.session.user.id;
    const roomID = req.params.roomID;
    const messageID = req.params.messageID;

    // If the user is a Student, verify that the message they wish to delete is their own (Students may only delete their own messages)
    if (!req.session.user.isTeacher) {
      const confirmOwnershipQuery = "SELECT * FROM message WHERE message_id = $1 AND room_id = $2 member_id = $3";
      const result = await pool.query(confirmOwnershipQuery, [messageID, roomID, userID]);
      if(!result.rowCount) {
        return res.sendStatus(401);
      }
    }

    const deleteMessageQuery = "DELETE FROM message WHERE message_id = $1 AND room_id = $2";
    await pool.query(deleteMessageQuery, [messageID, roomID]);

    return res.sendStatus(204);
    
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

export { getOwnedRooms, getMessages, postMessage, deleteMessage, createRoom, deleteRoom };
