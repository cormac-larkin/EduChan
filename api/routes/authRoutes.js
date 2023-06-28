import { Router } from "express";
import { registerTeacher, registerStudent, login, checkAuth } from "../controllers/authControllers.js";

const router = Router();

router.get("/", checkAuth);
router.post("/register/teacher", registerTeacher);
router.post("/register/student", registerStudent);
router.post("/login", login);

export default router;
