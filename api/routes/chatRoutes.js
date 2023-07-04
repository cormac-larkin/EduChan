import { Router } from "express";
import verifyTeacherRole from "../middleware/verifyTeacherRole.js";
import { getOwnedRooms, getMessages, postMessage, deleteMessage, createRoom, deleteRoom } from "../controllers/chatControllers.js";

const router = Router();

router.post("/", verifyTeacherRole, createRoom);
router.delete("/:roomID", verifyTeacherRole, deleteRoom);
router.get("/:roomID/messages", getMessages);
router.post("/:roomID/messages", postMessage);
router.delete("/:roomID/messages/:messageID", deleteMessage);

export default router;