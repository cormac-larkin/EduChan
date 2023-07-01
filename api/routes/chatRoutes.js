import { Router } from "express";
import verifyTeacherRole from "../middleware/verifyTeacherRole.js";
import { getOwnedRooms, getMessages, postMessage, deleteMessage, createRoom, deleteRoom } from "../controllers/chatControllers.js";

const router = Router();

router.get("/", verifyTeacherRole, getOwnedRooms); // Returns the list of active rooms a Teacher has created
router.post("/create", verifyTeacherRole, createRoom);
router.delete("/delete/:roomID", verifyTeacherRole, deleteRoom);
router.get("/:roomID/messages", getMessages);
router.post("/:roomID/messages", postMessage);
router.delete("/messages/:messageID", deleteMessage);

export default router;