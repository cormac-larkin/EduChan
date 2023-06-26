import { Router } from "express";
import { registerTeacher, registerStudent, login } from "../controllers/authControllers.js";

const router = Router();

router.post("/register/teacher", registerTeacher);
router.post("/register/student", registerStudent);
router.post("/login", login);

export default router;
