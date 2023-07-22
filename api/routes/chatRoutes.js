import { Router } from "express";
import verifyAuthStatus from "../middleware/verifyAuthStatus.js";
import verifyTeacherRole from "../middleware/verifyTeacherRole.js";
import { getChatByID, getMessages, postMessage, deleteMessage, createRoom, deleteRoom, enrolStudentsManually, batchEnrolStudents, enrolTeachers, showMessage, hideMessage } from "../controllers/chatControllers.js";

const router = Router();

router.use(verifyAuthStatus); // All '/chat' endpoints require authorization.

router.post("/", createRoom);
router.delete("/:roomID", deleteRoom);
router.post("/:roomID/students", enrolStudentsManually);
router.post("/:roomID/students/batch", batchEnrolStudents);
router.post("/:roomID/teachers", enrolTeachers);
router.get("/:roomID", getChatByID);
router.get("/:roomID/messages", getMessages);
router.put("/:roomID/messages/:messageID/hide", hideMessage);
router.put("/:roomID/messages/:messageID/show", showMessage);
router.post("/:roomID/messages", postMessage);
router.delete("/:roomID/messages/:messageID", verifyTeacherRole, deleteMessage);

export default router;