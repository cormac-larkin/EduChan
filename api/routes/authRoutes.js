import { Router } from "express";
import { login, checkAuth } from "../controllers/authControllers.js";

const router = Router();

router.get("/", checkAuth);
router.post("/login", login);

export default router;
