import { Router } from "express";
import { registerStudent, registerTeacher, getUser, getOwnedChats, getJoinedChats } from "../controllers/userControllers.js";
import verifyAuthStatus from "../middleware/verifyAuthStatus.js";

const router = Router();

router.use(verifyAuthStatus); // All endpoints require authentication

router.get("/:userID", getUser);
router.get("/:userID/chats/owned", getOwnedChats);
router.get("/:userID/chats/joined", getJoinedChats);
router.post("/teachers", registerTeacher);
router.post("/students", registerStudent);

export default router;