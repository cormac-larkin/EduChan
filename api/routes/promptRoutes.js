import { Router } from "express";
import verifyAuthStatus from "../middleware/verifyAuthStatus.js";
import verifyTeacherRole from "../middleware/verifyTeacherRole.js";
import {
  createPrompt,
  getPrompt,
  postResponse,
  getResponses
} from "../controllers/promptControllers.js";

const router = Router();

router.use(verifyAuthStatus); // All '/prompt' endpoints require authorization

router.post("/", verifyTeacherRole, createPrompt);
router.get("/:promptID", getPrompt);
router.post("/:promptID/responses", postResponse);
router.get("/:promptID/responses", verifyTeacherRole, getResponses);

export default router;
