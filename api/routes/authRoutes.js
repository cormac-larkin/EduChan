import { Router } from "express";
import { registerTeacher, registerStudent} from "../controllers/authControllers.js";

const router = Router();

router.post("/register/teacher", registerTeacher);
router.post("/register/student", registerStudent);

export default router;
