import { Router } from "express";
import verifyAuthStatus from "../middleware/verifyAuthStatus.js";
import verifyTeacherRole from "../middleware/verifyTeacherRole.js";
import {
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
} from "../controllers/chatControllers.js";

const router = Router();

router.use(verifyAuthStatus); // All '/chat' endpoints require authorization.

router.post("/", createRoom);
router.delete("/:roomID", deleteRoom);

router.post("/:roomID/students", enrolStudentsManually);
router.post("/:roomID/students/batch", batchEnrolStudents);
router.post("/:roomID/teachers", enrolTeachers);

router.get("/:roomID", getChatByID);
router.get("/:roomID/messages", getMessages);
router.post("/:roomID/messages", postMessage);

router.put("/:roomID/read-only", verifyTeacherRole, changeReadOnlyStatus);

router.put("/:roomID/hide", verifyTeacherRole, hideRoom);
router.put("/:roomID/show", verifyTeacherRole, showRoom);

router.put("/:roomID/messages/:messageID/hide", hideMessage);
router.put("/:roomID/messages/:messageID/show", showMessage);

router.put("/messages/:messageID/end-quiz", endQuiz);

router.post("/:roomID/messages/:messageID/like", likeMessage);
router.delete("/:roomID/messages/:messageID/like", unlikeMessage);

router.delete("/:roomID/messages/:messageID", verifyTeacherRole, deleteMessage);

export default router;
