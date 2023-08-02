import { Router } from "express";
import { registerStudent, registerTeacher, getUser, getAllUsers, getOwnedChats, getJoinedChats, approveUsers, getQuizAttempts, getOwnedQuizzes } from "../controllers/userControllers.js";
import verifyAuthStatus from "../middleware/verifyAuthStatus.js";
import verifyAdminStatus from "../middleware/verifyAdminStatus.js";
import verifyTeacherRole from "../middleware/verifyTeacherRole.js";
const router = Router();

router.get("/", verifyAuthStatus, verifyAdminStatus, getAllUsers); // Only accessible to admin users
router.post("/approve", verifyAuthStatus, verifyAdminStatus, approveUsers); // Only admins can approve other Users

router.get("/:userID", verifyAuthStatus, getUser);

router.get("/:userID/chats/owned", verifyAuthStatus, getOwnedChats);
router.get("/:userID/chats/joined", verifyAuthStatus, getJoinedChats);

router.get("/:userID/quizzes", verifyAuthStatus, verifyTeacherRole, getOwnedQuizzes);

router.get("/:userID/quizzes/attempts", verifyAuthStatus, getQuizAttempts);

router.post("/teachers", registerTeacher);
router.post("/students", registerStudent);

export default router;