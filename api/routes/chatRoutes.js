import { Router } from "express";
import verifyAuthStatus from "../middleware/verifyAuthStatus.js";
import { getChatByID, getMessages, postMessage, deleteMessage, createRoom, deleteRoom, enrolStudentsManually, batchEnrolStudents } from "../controllers/chatControllers.js";

const router = Router();

router.use(verifyAuthStatus); // All '/chat' endpoints require authorization.

router.post("/", createRoom);
router.delete("/:roomID", deleteRoom);
router.post("/:roomID/students", enrolStudentsManually);
router.post("/:roomID/students/batch", batchEnrolStudents);
router.get("/:roomID", getChatByID);
router.get("/:roomID/messages", getMessages);
router.post("/:roomID/messages", postMessage);
router.delete("/:roomID/messages/:messageID", deleteMessage);

export default router;