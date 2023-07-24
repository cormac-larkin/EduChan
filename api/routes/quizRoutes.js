import { Router } from "express";
import verifyAuthStatus from "../middleware/verifyAuthStatus.js";
import verifyTeacherRole from "../middleware/verifyTeacherRole.js";
import { createQuiz } from "../controllers/quizControllers.js";

const router = Router();

router.use(verifyAuthStatus); // All '/quiz' endpoints require authorization.

router.post("/", verifyTeacherRole, createQuiz);

export default router;