import { Router } from "express";
import verifyAuthStatus from "../middleware/verifyAuthStatus.js";
import verifyTeacherRole from "../middleware/verifyTeacherRole.js";
import { addQuestion, createQuiz, getQuiz, addAttempt, getAttempt, editQuestion, getReportByQuiz } from "../controllers/quizControllers.js";

const router = Router();

router.use(verifyAuthStatus); // All '/quiz' endpoints require authorization.

router.post("/", verifyTeacherRole, createQuiz);
router.get("/:quizID", getQuiz); 
router.post("/:quizID", verifyTeacherRole, addQuestion); 
router.put("/:quizID/questions/:questionID", verifyTeacherRole, editQuestion);
router.post("/:quizID/attempts", addAttempt); 
router.get("/attempts/:attemptID", getAttempt); 
router.get("/:quizID/report", verifyTeacherRole, getReportByQuiz); 

export default router;