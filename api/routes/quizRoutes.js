import { Router } from "express";
import verifyAuthStatus from "../middleware/verifyAuthStatus.js";
import verifyTeacherRole from "../middleware/verifyTeacherRole.js";
import { addQuestion, createQuiz, getQuiz, addAttempt } from "../controllers/quizControllers.js";

const router = Router();

router.use(verifyAuthStatus); // All '/quiz' endpoints require authorization.

router.post("/", verifyTeacherRole, createQuiz);
router.get("/:quizID", getQuiz);
router.post("/:quizID", addQuestion);
router.post("/:quizID/attempts", addAttempt);

export default router;