import { Router } from "express";
import { registerStudent, registerTeacher, getUser, getOwnedChats } from "../controllers/userControllers.js";

const router = Router();

router.get("/:userID", getUser);
router.get("/:userID/chats", getOwnedChats);
router.post("/teacher", registerTeacher);
router.post("/student", registerStudent);

export default router;