import { Router } from "express";
import verifyTeacherRole from "../middleware/verifyTeacherRole.js";
import { getChatByID, getMessages, postMessage, deleteMessage, createRoom, deleteRoom, addUsersToChat } from "../controllers/chatControllers.js";

const router = Router();

router.post("/", verifyTeacherRole, createRoom);
router.delete("/:roomID", verifyTeacherRole, deleteRoom);
router.post("/:roomID/members", addUsersToChat);
router.get("/:roomID", getChatByID);
router.get("/:roomID/messages", getMessages);
router.post("/:roomID/messages", postMessage);
router.delete("/:roomID/messages/:messageID", deleteMessage);

export default router;